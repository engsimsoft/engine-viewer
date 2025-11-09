/**
 * Express Server for Engine Results Viewer
 *
 * REST API для работы с .det файлами
 */

import express from 'express';
import cors from 'cors';
import { stat } from 'fs/promises';
import { loadConfig, validateConfig, getDataFolderPath } from './config.js';
import projectsRouter from './routes/projects.js';
import dataRouter from './routes/data.js';
import metadataRouter from './routes/metadata.js';
import { createQueueRouter } from './routes/queue.js';
import { scanProjects, createFileWatcher, parsePrtFileAndUpdateMetadata, shouldParsePrt, normalizeFilenameToId } from './services/fileScanner.js';
import { getGlobalQueue } from './services/prtQueue.js';
import { basename } from 'path';

// Инициализация Express
const app = express();

/**
 * Middleware Setup
 */

// CORS - разрешить запросы с frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// JSON parsing
app.use(express.json());

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Engine Results Viewer API',
    version: '1.0.0',
    description: 'REST API for engine calculation data visualization',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
      },
      projects: {
        method: 'GET',
        path: '/projects',
        description: 'Get list of all available projects'
      },
      project: {
        method: 'GET',
        path: '/project/:id',
        description: 'Get full data for a specific project'
      },
      metadata: {
        get: {
          method: 'GET',
          path: '/projects/:id/metadata',
          description: 'Get project metadata'
        },
        save: {
          method: 'POST',
          path: '/projects/:id/metadata',
          description: 'Create or update project metadata'
        },
        delete: {
          method: 'DELETE',
          path: '/projects/:id/metadata',
          description: 'Delete project metadata'
        }
      }
    },
    documentation: 'See docs/api.md for detailed API documentation',
    note: 'When accessed through frontend proxy (http://localhost:5173/api/*), the /api prefix is automatically stripped'
  });
});

// API Routes
app.use('/projects', projectsRouter);
app.use('/projects', metadataRouter); // Metadata routes: /projects/:id/metadata
app.use('/project', dataRouter);

// Queue status API (uses global queue instance)
const globalPrtQueue = getGlobalQueue({ concurrency: 3 });
const queueRouter = createQueueRouter(globalPrtQueue);
app.use('/queue', queueRouter);

/**
 * Error Handling Middleware
 */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      code: 'NOT_FOUND'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

/**
 * Server Startup
 */
let fileWatcher = null; // Store file watcher reference for cleanup

async function startServer() {
  try {
    // Загрузить конфигурацию
    console.log('\n📋 Loading configuration...');
    const config = await loadConfig();
    validateConfig(config);

    // Сохранить config в app.locals для доступа из routes
    app.locals.config = config;

    // Get data folder path
    const dataFolderPath = getDataFolderPath(config);

    // Get global PRT parsing queue instance (already initialized at top level)
    const prtQueue = globalPrtQueue;
    console.log('✅ PRT parsing queue ready (concurrency: 3)');

    // Startup scan: process all existing files (including .prt files)
    console.log('\n🔍 Performing startup scan...');
    const startTime = Date.now();
    const projects = await scanProjects(
      dataFolderPath,
      config.files.extensions,
      config.files.maxSize,
      prtQueue  // Pass queue for background .prt parsing
    );
    const scanDuration = Date.now() - startTime;
    console.log(`✅ Startup scan complete: ${projects.length} projects found (${scanDuration}ms)`);

    // Start file watcher for real-time updates
    console.log('\n👀 Starting file watcher...');
    fileWatcher = createFileWatcher(
      dataFolderPath,
      config.files.extensions,
      {
        onAdd: async (filePath) => {
          const fileName = basename(filePath);
          console.log(`[Watcher] 📄 New file detected: ${fileName}`);

          // If it's a .prt file, check cache before queuing
          if (fileName.endsWith('.prt')) {
            const projectId = normalizeFilenameToId(fileName);
            const needsParsing = await shouldParsePrt(filePath, projectId);

            if (needsParsing) {
              console.log(`[Watcher] New .prt file: ${fileName} → queued (high priority)`);
              try {
                const stats = await stat(filePath);
                const file = {
                  name: fileName,
                  path: filePath,
                  size: stats.size,
                  mtime: stats.mtime
                };
                await prtQueue.addToQueue(file, parsePrtFileAndUpdateMetadata, 'high');
                console.log(`[Watcher] ✅ Queued for processing: ${fileName}`);
              } catch (error) {
                console.error(`[Watcher] ❌ Error queuing ${fileName}:`, error.message);
              }
            } else {
              console.log(`[Watcher] Cache valid for ${fileName} → skip`);
            }
          }
        },

        onChange: async (filePath) => {
          const fileName = basename(filePath);
          console.log(`[Watcher] 📝 File modified: ${fileName}`);

          // If it's a .prt file, check cache before re-queuing
          if (fileName.endsWith('.prt')) {
            const projectId = normalizeFilenameToId(fileName);
            const needsParsing = await shouldParsePrt(filePath, projectId);

            if (needsParsing) {
              console.log(`[Watcher] Changed .prt file: ${fileName} → re-queued (high priority)`);
              try {
                const stats = await stat(filePath);
                const file = {
                  name: fileName,
                  path: filePath,
                  size: stats.size,
                  mtime: stats.mtime
                };
                await prtQueue.addToQueue(file, parsePrtFileAndUpdateMetadata, 'high');
                console.log(`[Watcher] ✅ Re-queued for processing: ${fileName}`);
              } catch (error) {
                console.error(`[Watcher] ❌ Error re-queuing ${fileName}:`, error.message);
              }
            } else {
              console.log(`[Watcher] Cache valid for ${fileName} → skip`);
            }
          }
        },

        onRemove: (filePath) => {
          const fileName = basename(filePath);
          console.log(`[Watcher] 🗑️  File removed: ${fileName}`);
          // Note: Metadata files are not automatically deleted when .prt is removed
          // This allows manual metadata to persist even if .prt is temporarily missing
        },

        onError: (error) => {
          console.error('[Watcher] ❌ File watcher error:', error);
        }
      }
    );

    // Запустить сервер
    const PORT = process.env.PORT || config.server.port;
    const HOST = process.env.HOST || config.server.host;

    app.listen(PORT, HOST, () => {
      console.log('\n🚀 Server started successfully!');
      console.log(`   URL: http://${HOST}:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://${HOST}:${PORT}/health`);
      console.log(`   API info: http://${HOST}:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n📴 SIGTERM received, shutting down gracefully...');
  if (fileWatcher) {
    await fileWatcher.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📴 SIGINT received, shutting down gracefully...');
  if (fileWatcher) {
    await fileWatcher.close();
  }
  process.exit(0);
});

// Start the server
startServer();

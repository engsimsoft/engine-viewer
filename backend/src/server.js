/**
 * Express Server for Engine Results Viewer
 *
 * REST API для работы с .det файлами
 */

import express from 'express';
import cors from 'cors';
import { loadConfig, validateConfig } from './config.js';
import projectsRouter from './routes/projects.js';
import dataRouter from './routes/data.js';
import metadataRouter from './routes/metadata.js';

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
async function startServer() {
  try {
    // Загрузить конфигурацию
    console.log('\n📋 Loading configuration...');
    const config = await loadConfig();
    validateConfig(config);

    // Сохранить config в app.locals для доступа из routes
    app.locals.config = config;

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
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

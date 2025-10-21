/**
 * API Routes: Projects List
 *
 * Endpoints:
 * - GET /api/projects - Get list of all available .det projects
 *
 * @module routes/projects
 */

import { Router } from 'express';
import { scanProjects, getDirectoryStats, formatFileSize } from '../services/fileScanner.js';
import { getConfig, getDataFolderPath } from '../config.js';

const router = Router();

/**
 * @typedef {Object} ProjectListItem
 * @property {string} id - Unique project identifier (filename without extension)
 * @property {string} name - Display name (filename without extension)
 * @property {string} fileName - Full filename with extension
 * @property {number} numCylinders - Number of engine cylinders
 * @property {string} engineType - Engine type (NATUR, TURBO, etc.)
 * @property {number} calculationsCount - Number of calculations in the project
 * @property {number} fileSize - File size in bytes
 * @property {string} fileSizeFormatted - Human-readable file size (e.g., "156.3 KB")
 * @property {string} lastModified - ISO 8601 date string of last modification
 * @property {string} created - ISO 8601 date string of file creation
 */

/**
 * @typedef {Object} ProjectsResponse
 * @property {boolean} success - Whether the request was successful
 * @property {ProjectListItem[]} data - Array of project summaries
 * @property {Object} meta - Metadata about the response
 * @property {number} meta.total - Total number of projects
 * @property {number} meta.scannedAt - Timestamp when scan was performed
 * @property {Object} meta.directory - Information about the scanned directory
 * @property {string} meta.directory.path - Absolute path to data directory
 * @property {number} meta.directory.totalFiles - Total .det files found
 * @property {number} meta.directory.totalSize - Total size of all .det files in bytes
 * @property {string} meta.directory.totalSizeFormatted - Human-readable total size
 */

/**
 * GET /api/projects
 *
 * Get list of all available engine calculation projects (.det files).
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "vesta-1-6-im",
 *       "name": "Vesta 1.6 IM",
 *       "fileName": "Vesta 1.6 IM.det",
 *       "numCylinders": 4,
 *       "engineType": "NATUR",
 *       "calculationsCount": 17,
 *       "fileSize": 156234,
 *       "fileSizeFormatted": "156.2 KB",
 *       "lastModified": "2025-10-21T15:30:00.000Z",
 *       "created": "2025-10-20T10:00:00.000Z"
 *     }
 *   ],
 *   "meta": {
 *     "total": 1,
 *     "scannedAt": 1729523400000,
 *     "directory": {
 *       "path": "/Users/mactm/Projects/engine-viewer/test-data",
 *       "totalFiles": 1,
 *       "totalSize": 156234,
 *       "totalSizeFormatted": "156.2 KB"
 *     }
 *   }
 * }
 *
 * Error responses:
 * - 404: Data directory not found
 * - 500: Server error (scan failed, config error, etc.)
 */
router.get('/', async (req, res, next) => {
  try {
    // Get configuration (loaded at server startup)
    const config = getConfig();
    const dataFolderPath = getDataFolderPath(config);

    console.log(`[API] GET /api/projects - Scanning directory: ${dataFolderPath}`);

    // Scan projects
    const startTime = Date.now();
    const projects = await scanProjects(
      dataFolderPath,
      config.files.extensions,
      config.files.maxSize
    );
    const scanDuration = Date.now() - startTime;

    // Get directory statistics
    const dirStats = await getDirectoryStats(dataFolderPath, config.files.extensions);

    // Transform projects to API response format
    const projectsData = projects.map(project => ({
      id: project.id,
      name: project.name, // Display name (filename without extension)
      fileName: project.fileName,
      numCylinders: project.numCylinders || 0,
      engineType: project.engineType || 'UNKNOWN',
      calculationsCount: project.calculationsCount || 0,
      fileSize: project.fileSize,
      fileSizeFormatted: formatFileSize(project.fileSize),
      lastModified: project.modifiedAt,
      created: project.createdAt
    }));

    // Sort by last modified date (newest first)
    projectsData.sort((a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    // Build response
    const response = {
      success: true,
      data: projectsData,
      meta: {
        total: projectsData.length,
        scannedAt: Date.now(),
        scanDuration: scanDuration,
        directory: {
          path: dataFolderPath,
          totalFiles: dirStats.totalFiles,
          totalSize: dirStats.totalSize,
          totalSizeFormatted: dirStats.totalSizeFormatted
        }
      }
    };

    console.log(`[API] GET /api/projects - Success: ${projectsData.length} projects found (${scanDuration}ms)`);

    res.json(response);
  } catch (error) {
    console.error('[API] GET /api/projects - Error:', error.message);

    // Check if error is due to directory not found
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DIRECTORY_NOT_FOUND',
          message: 'Data directory not found',
          details: error.message
        }
      });
    }

    // Pass other errors to global error handler
    next(error);
  }
});

export default router;

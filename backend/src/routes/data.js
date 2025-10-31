/**
 * API Routes: Project Data
 *
 * Endpoints:
 * - GET /api/project/:id - Get full data for a specific project
 *
 * @module routes/data
 */

import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { parseDetFile } from '../services/fileParser.js';
import { getConfig, getDataFolderPath } from '../config.js';
import { getFileInfo, normalizeFilenameToId } from '../services/fileScanner.js';

const router = Router();

/**
 * @typedef {Object} CylinderData
 * @property {number[]} PurCyl - Pure cylinder values
 * @property {number[]} TUbMax - Maximum exhaust temperature
 * @property {number[]} TCylMax - Maximum cylinder temperature
 * @property {number[]} PCylMax - Maximum cylinder pressure
 * @property {number[]} Deto - Detonation values
 */

/**
 * @typedef {Object} DataPoint
 * @property {number} RPM - Engine speed (revolutions per minute)
 * @property {number} PAv - Average power (kW)
 * @property {number} Torque - Torque (N·m)
 * @property {CylinderData} cylinders - Data for each cylinder
 * @property {number} Convergence - Convergence value
 */

/**
 * @typedef {Object} Calculation
 * @property {string} id - Calculation identifier (e.g., "$1", "$2", "$3.1")
 * @property {string} marker - Original marker from .det file
 * @property {DataPoint[]} dataPoints - Array of measurement points
 * @property {Object} metadata - Calculation metadata
 * @property {number} metadata.totalPoints - Total number of data points
 * @property {Object} metadata.rpmRange - RPM range
 * @property {number} metadata.rpmRange.min - Minimum RPM
 * @property {number} metadata.rpmRange.max - Maximum RPM
 * @property {Object} metadata.powerRange - Power range (kW)
 * @property {number} metadata.powerRange.min - Minimum power
 * @property {number} metadata.powerRange.max - Maximum power
 * @property {Object} metadata.torqueRange - Torque range (N·m)
 * @property {number} metadata.torqueRange.min - Minimum torque
 * @property {number} metadata.torqueRange.max - Maximum torque
 */

/**
 * @typedef {Object} EngineMetadata
 * @property {number} numCylinders - Number of engine cylinders
 * @property {string} engineType - Engine type (NATUR, TURBO, etc.)
 */

/**
 * @typedef {Object} ProjectDataResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} data - Project data
 * @property {string} data.id - Project identifier
 * @property {string} data.name - Project name
 * @property {string} data.fileName - File name
 * @property {EngineMetadata} data.metadata - Engine metadata
 * @property {Calculation[]} data.calculations - Array of calculations
 * @property {Object} data.fileInfo - File information
 * @property {number} data.fileInfo.size - File size in bytes
 * @property {string} data.fileInfo.sizeFormatted - Human-readable file size
 * @property {string} data.fileInfo.lastModified - Last modification date (ISO 8601)
 * @property {string} data.fileInfo.created - Creation date (ISO 8601)
 * @property {Object} meta - Response metadata
 * @property {number} meta.totalCalculations - Total number of calculations
 * @property {number} meta.totalDataPoints - Total number of data points across all calculations
 * @property {number} meta.parseDuration - Time taken to parse the file (ms)
 */

/**
 * Helper: Generate calculation metadata
 *
 * @param {DataPoint[]} dataPoints - Array of data points
 * @returns {Object} Metadata object with ranges and statistics
 */
function generateCalculationMetadata(dataPoints) {
  if (!dataPoints || dataPoints.length === 0) {
    return {
      totalPoints: 0,
      rpmRange: { min: 0, max: 0 },
      powerRange: { min: 0, max: 0 },
      torqueRange: { min: 0, max: 0 }
    };
  }

  const rpms = dataPoints.map(dp => dp.RPM);
  const powers = dataPoints.map(dp => dp.PAv);
  const torques = dataPoints.map(dp => dp.Torque);

  return {
    totalPoints: dataPoints.length,
    rpmRange: {
      min: Math.min(...rpms),
      max: Math.max(...rpms)
    },
    powerRange: {
      min: Math.min(...powers),
      max: Math.max(...powers)
    },
    torqueRange: {
      min: Math.min(...torques),
      max: Math.max(...torques)
    }
  };
}

/**
 * GET /api/project/:id
 *
 * Get full data for a specific project by ID.
 *
 * URL Parameters:
 * - id: Project identifier (normalized filename without extension)
 *       Example: "vesta-1-6-im" for "Vesta 1.6 IM.det"
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "vesta-1-6-im",
 *     "name": "Vesta 1.6 IM",
 *     "fileName": "Vesta 1.6 IM.det",
 *     "metadata": {
 *       "numCylinders": 4,
 *       "engineType": "NATUR"
 *     },
 *     "calculations": [
 *       {
 *         "id": "$1",
 *         "marker": "$1",
 *         "dataPoints": [...],
 *         "metadata": {
 *           "totalPoints": 26,
 *           "rpmRange": { "min": 2000, "max": 7800 },
 *           "powerRange": { "min": 23.37, "max": 137.05 },
 *           "torqueRange": { "min": 89.28, "max": 191.62 }
 *         }
 *       }
 *     ],
 *     "fileInfo": {
 *       "size": 156234,
 *       "sizeFormatted": "156.2 KB",
 *       "lastModified": "2025-10-21T15:30:00.000Z",
 *       "created": "2025-10-20T10:00:00.000Z"
 *     }
 *   },
 *   "meta": {
 *     "totalCalculations": 17,
 *     "totalDataPoints": 443,
 *     "parseDuration": 6
 *   }
 * }
 *
 * Error responses:
 * - 400: Invalid project ID
 * - 404: Project not found
 * - 500: Server error (parse error, file read error, etc.)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || !/^[a-z0-9-]+$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project ID format',
          details: 'Project ID must contain only lowercase letters, numbers, and hyphens'
        }
      });
    }

    console.log(`[API] GET /api/project/${id} - Loading project...`);

    // Get configuration (loaded at server startup)
    const config = getConfig();
    const dataFolderPath = getDataFolderPath(config);

    // Scan directory to find matching file
    const files = await fs.readdir(dataFolderPath);
    const detFiles = files.filter(file =>
      config.files.extensions.includes(path.extname(file))
    );

    // Find file matching the ID
    let matchedFile = null;
    for (const filename of detFiles) {
      const fileId = normalizeFilenameToId(filename);
      if (fileId === id) {
        matchedFile = filename;
        break;
      }
    }

    if (!matchedFile) {
      console.warn(`[API] GET /api/project/${id} - Project not found`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          details: `No project found with ID: ${id}`
        }
      });
    }

    const filePath = path.join(dataFolderPath, matchedFile);

    // Parse the .det file
    const startTime = Date.now();
    const projectData = await parseDetFile(filePath);
    const parseDuration = Date.now() - startTime;

    // Get file info
    const fileInfo = await getFileInfo(filePath);

    // Calculate metadata for each calculation
    const calculationsWithMetadata = projectData.calculations.map(calc => ({
      id: calc.id,
      name: calc.name,  // Название расчёта без $ (например "14 UpDate")
      dataPoints: calc.dataPoints,
      metadata: generateCalculationMetadata(calc.dataPoints)
    }));

    // Calculate total data points
    const totalDataPoints = calculationsWithMetadata.reduce(
      (sum, calc) => sum + calc.dataPoints.length,
      0
    );

    // Get project name (filename without extension)
    const projectName = matchedFile.replace(/\.det$/i, '');

    // Build response
    const response = {
      success: true,
      data: {
        id: id,
        name: projectName,
        fileName: matchedFile,
        metadata: projectData.metadata,
        calculations: calculationsWithMetadata,
        fileInfo: {
          size: fileInfo.size,
          sizeFormatted: fileInfo.sizeFormatted,
          lastModified: fileInfo.lastModified,
          created: fileInfo.created
        }
      },
      meta: {
        totalCalculations: calculationsWithMetadata.length,
        totalDataPoints: totalDataPoints,
        parseDuration: parseDuration
      }
    };

    console.log(`[API] GET /api/project/${id} - Success: ${calculationsWithMetadata.length} calculations, ${totalDataPoints} data points (${parseDuration}ms)`);

    res.json(response);
  } catch (error) {
    console.error(`[API] GET /api/project/${req.params.id} - Error:`, error.message);

    // Check if error is due to file not found
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project file not found',
          details: error.message
        }
      });
    }

    // Pass other errors to global error handler
    next(error);
  }
});

export default router;

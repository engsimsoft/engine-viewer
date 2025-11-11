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
import { readdir } from 'fs/promises';
import { parseDetFile } from '../services/fileParser.js';
import { getConfig, getDataFolderPath } from '../config.js';
import { getFileInfo, normalizeFilenameToId, scanDirectory } from '../services/fileScanner.js';
import { parseEngineFile } from '../parsers/index.js';

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

    // Recursively scan directory to find matching file (supports subdirectories)
    // IMPORTANT: Only scan .det and .pou files (not .prt) because .prt files don't contain calculations
    const allFiles = await scanDirectory(dataFolderPath, ['.det', '.pou']);

    // Find file matching the ID
    let matchedFileInfo = null;
    for (const fileInfo of allFiles) {
      const fileId = normalizeFilenameToId(fileInfo.name);
      if (fileId === id) {
        matchedFileInfo = fileInfo;
        break;
      }
    }

    if (!matchedFileInfo) {
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

    const filePath = matchedFileInfo.path;

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
    const projectName = matchedFileInfo.name.replace(/\.(det|pou)$/i, '');

    // Build response
    const response = {
      success: true,
      data: {
        id: id,
        name: projectName,
        fileName: matchedFileInfo.name,
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

/**
 * GET /api/project/:id/summary
 *
 * Get project summary with analysis types availability.
 * Used by Project Overview page to display available analysis types.
 *
 * URL Parameters:
 * - id: Project identifier (normalized filename without extension)
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "project": {
 *       "id": "vesta-16-im",
 *       "displayName": "Vesta 1.6 IM",
 *       "specs": {
 *         "cylinders": 4,
 *         "engineType": "NATUR"
 *       }
 *     },
 *     "availability": {
 *       "performance": {
 *         "available": true,
 *         "calculationsCount": 3,
 *         "lastRun": "2025-11-07T14:30:00Z"
 *       },
 *       "traces": {
 *         "available": true,
 *         "rpmPointsCount": 11,
 *         "traceTypes": ["pressure", "temperature"]
 *       },
 *       "pvDiagrams": { "available": false },
 *       "noise": { "available": false },
 *       "turbo": { "available": false },
 *       "configuration": { "available": false }
 *     }
 *   }
 * }
 *
 * Error responses:
 * - 400: Invalid project ID
 * - 404: Project not found
 * - 500: Server error
 */
router.get('/:id/summary', async (req, res, next) => {
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

    console.log(`[API] GET /api/project/${id}/summary - Loading project summary...`);

    // Get configuration
    const config = getConfig();
    const dataFolderPath = getDataFolderPath(config);

    // Scan directory to find matching file
    const allFiles = await scanDirectory(dataFolderPath, ['.det', '.pou']);

    // Find file matching the ID
    let matchedFileInfo = null;
    for (const fileInfo of allFiles) {
      const fileId = normalizeFilenameToId(fileInfo.name);
      if (fileId === id) {
        matchedFileInfo = fileInfo;
        break;
      }
    }

    if (!matchedFileInfo) {
      console.warn(`[API] GET /api/project/${id}/summary - Project not found`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          details: `No project found with ID: ${id}`
        }
      });
    }

    // Parse project file to get metadata and calculations
    const projectData = await parseDetFile(matchedFileInfo.path);
    const fileInfo = await getFileInfo(matchedFileInfo.path);

    // Get project folder path (parent directory of the .det/.pou file)
    const projectFolderPath = path.dirname(matchedFileInfo.path);

    // Check availability for each analysis type

    // 1. Performance - available if .det or .pou file exists (we already found it)
    const performanceAvailability = {
      available: true,
      calculationsCount: projectData.calculations?.length || 0,
      lastRun: fileInfo.modifiedAt
    };

    // 2. Traces - check if trace files exist in project folder
    // Trace file extensions: .cyl, .pvd, .wve, .wmf, .tpt, .mch, etc.
    const traceExtensions = ['.cyl', '.pvd', '.wve', '.wmf', '.tpt', '.mch', '.pur', '.eff'];
    let tracesAvailability = { available: false };

    try {
      const projectFiles = await readdir(projectFolderPath);
      const traceFiles = projectFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return traceExtensions.includes(ext);
      });

      if (traceFiles.length > 0) {
        // Extract RPM points from trace filenames (e.g., "0.55 MF V1_10000.cyl" → 10000 RPM)
        const rpmPoints = new Set();
        const traceTypes = new Set();

        traceFiles.forEach(file => {
          // Try to extract RPM from filename (pattern: _XXXXX.ext)
          const rpmMatch = file.match(/_(\d{4,5})\./);
          if (rpmMatch) {
            rpmPoints.add(parseInt(rpmMatch[1], 10));
          }

          // Detect trace type from extension
          const ext = path.extname(file).toLowerCase();
          if (ext === '.cyl' || ext === '.pvd') traceTypes.add('pressure');
          if (ext === '.tpt') traceTypes.add('temperature');
          if (ext === '.wve' || ext === '.wmf') traceTypes.add('wave');
          if (ext === '.mch') traceTypes.add('mach');
        });

        tracesAvailability = {
          available: true,
          rpmPointsCount: rpmPoints.size,
          traceTypes: Array.from(traceTypes)
        };
      }
    } catch (error) {
      console.warn(`[API] Could not check trace files for ${id}:`, error.message);
      // Keep tracesAvailability as { available: false }
    }

    // 3. PV-Diagrams - check if .pvd files exist in project folder
    let pvDiagramsAvailability = { available: false };

    try {
      const projectFiles = await readdir(projectFolderPath);
      const pvdFiles = projectFiles.filter(file => file.toLowerCase().endsWith('.pvd'));

      if (pvdFiles.length > 0) {
        // Extract RPM points from .pvd filenames (e.g., "V8_2000.pvd" → 2000 RPM)
        const rpmPoints = new Set();

        pvdFiles.forEach(file => {
          // Try to extract RPM from filename (pattern: _XXXXX.pvd)
          const rpmMatch = file.match(/_(\d{4,5})\.pvd$/i);
          if (rpmMatch) {
            rpmPoints.add(parseInt(rpmMatch[1], 10));
          }
        });

        pvDiagramsAvailability = {
          available: true,
          filesCount: pvdFiles.length,
          rpmPointsCount: rpmPoints.size
        };
      }
    } catch (error) {
      console.warn(`[API] Could not check PVD files for ${id}:`, error.message);
      // Keep pvDiagramsAvailability as { available: false }
    }

    // 4-5. Noise, Turbo - not available yet (Phase 2+)
    const noiseAvailability = { available: false };
    const turboAvailability = { available: false };

    // 6. Configuration History - not implemented yet (Phase 2.1)
    const configurationAvailability = { available: false };

    // Build response
    const response = {
      success: true,
      data: {
        project: {
          id: id,
          displayName: matchedFileInfo.name.replace(/\.(det|pou)$/i, ''),
          specs: {
            cylinders: projectData.metadata?.numCylinders || 0,
            engineType: projectData.metadata?.engineType || 'UNKNOWN'
          }
        },
        availability: {
          performance: performanceAvailability,
          traces: tracesAvailability,
          pvDiagrams: pvDiagramsAvailability,
          noise: noiseAvailability,
          turbo: turboAvailability,
          configuration: configurationAvailability
        }
      }
    };

    console.log(`[API] GET /api/project/${id}/summary - Success`);

    res.json(response);
  } catch (error) {
    console.error(`[API] GET /api/project/${req.params.id}/summary - Error:`, error.message);

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

/**
 * GET /api/project/:id/pvd-files
 *
 * Get list of PV-Diagram files for a specific project with metadata.
 * Parses each .pvd file to extract peak pressure and RPM information.
 *
 * URL Parameters:
 * - id: Project identifier (normalized filename without extension)
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "projectId": "v8",
 *     "files": [
 *       {
 *         "fileName": "V8_2000.pvd",
 *         "rpm": 2000,
 *         "cylinders": 8,
 *         "engineType": "TURBO",
 *         "peakPressure": 156.789,
 *         "peakPressureAngle": 15.5,
 *         "dataPoints": 721
 *       },
 *       ...
 *     ]
 *   },
 *   "meta": {
 *     "totalFiles": 11,
 *     "rpmPoints": [2000, 2500, 3000, ...],
 *     "parseDuration": 45
 *   }
 * }
 *
 * Error responses:
 * - 400: Invalid project ID
 * - 404: Project not found or no PV-Diagrams available
 * - 500: Server error (parse error, file read error, etc.)
 */
router.get('/:id/pvd-files', async (req, res, next) => {
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

    console.log(`[API] GET /api/project/${id}/pvd-files - Loading PV-Diagram files...`);

    // Get configuration
    const config = getConfig();
    const dataFolderPath = getDataFolderPath(config);

    // Scan directory to find matching project file (.det or .pou)
    const allFiles = await scanDirectory(dataFolderPath, ['.det', '.pou']);

    // Find file matching the ID
    let matchedFileInfo = null;
    for (const fileInfo of allFiles) {
      const fileId = normalizeFilenameToId(fileInfo.name);
      if (fileId === id) {
        matchedFileInfo = fileInfo;
        break;
      }
    }

    if (!matchedFileInfo) {
      console.warn(`[API] GET /api/project/${id}/pvd-files - Project not found`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          details: `No project found with ID: ${id}`
        }
      });
    }

    // Get project folder path (parent directory of the .det/.pou file)
    const projectFolderPath = path.dirname(matchedFileInfo.path);

    // Find all .pvd files in project folder
    const projectFiles = await readdir(projectFolderPath);
    const pvdFiles = projectFiles.filter(file => file.toLowerCase().endsWith('.pvd'));

    if (pvdFiles.length === 0) {
      console.warn(`[API] GET /api/project/${id}/pvd-files - No PV-Diagram files found`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_PVD_FILES',
          message: 'No PV-Diagram files found',
          details: `Project ${id} has no .pvd files`
        }
      });
    }

    // Parse each .pvd file and extract metadata
    const startTime = Date.now();
    const filesWithMetadata = [];

    for (const fileName of pvdFiles) {
      try {
        const filePath = path.join(projectFolderPath, fileName);

        // Parse .pvd file using PvdParser
        const pvdData = await parseEngineFile(filePath);

        let peakPressure = 0;
        let peakPressureAngleRaw = 0; // Physical angle (e.g., 14° ATDC)
        let peakPressureAngleModified = 0; // TDC2-shifted angle for graph centering (e.g., 374°)
        const lastCylinderIndex = pvdData.metadata.cylinders - 1;

        for (const dataPoint of pvdData.data) {
          const cyl = dataPoint.cylinders[lastCylinderIndex];
          if (cyl.pressure > peakPressure) {
            peakPressure = cyl.pressure;
            peakPressureAngleRaw = dataPoint.deg; // Physical angle (14°)
            peakPressureAngleModified = (dataPoint.deg + 360) % 720; // Graph-centered (374°)
          }
        }

        filesWithMetadata.push({
          fileName: fileName,
          rpm: pvdData.metadata.rpm,
          cylinders: pvdData.metadata.cylinders,
          engineType: pvdData.metadata.engineType,
          peakPressure: parseFloat(peakPressure.toFixed(3)),
          peakPressureAngle: parseFloat(peakPressureAngleRaw.toFixed(2)), // Physical angle for educational display
          peakPressureAngleModified: parseFloat(peakPressureAngleModified.toFixed(2)), // TDC2-shifted for graph
          dataPoints: pvdData.data.length
        });
      } catch (error) {
        console.error(`[API] Error parsing ${fileName}:`, error.message);
        // Skip files that fail to parse
      }
    }

    const parseDuration = Date.now() - startTime;

    // Extract unique RPM points
    const rpmPoints = [...new Set(filesWithMetadata.map(f => f.rpm))].sort((a, b) => a - b);

    // Build response
    const response = {
      success: true,
      data: {
        projectId: id,
        files: filesWithMetadata
      },
      meta: {
        totalFiles: filesWithMetadata.length,
        rpmPoints: rpmPoints,
        parseDuration: parseDuration
      }
    };

    console.log(`[API] GET /api/project/${id}/pvd-files - Success: ${filesWithMetadata.length} files (${parseDuration}ms)`);

    res.json(response);
  } catch (error) {
    console.error(`[API] GET /api/project/${req.params.id}/pvd-files - Error:`, error.message);

    // Check if error is due to file not found
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found',
          details: error.message
        }
      });
    }

    // Pass other errors to global error handler
    next(error);
  }
});

/**
 * GET /api/project/:id/pvd/:fileName
 * Fetch specific .pvd file data (full parsed data)
 *
 * Response structure:
 * {
 *   success: true,
 *   data: {
 *     metadata: { rpm, cylinders, engineType, ... },
 *     columnHeaders: [...],
 *     data: [ { deg, cylinders: [{volume, pressure}, ...] }, ... ]
 *   }
 * }
 */
router.get('/:id/pvd/:fileName', async (req, res, next) => {
  try {
    const { id, fileName } = req.params;

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

    // Validate fileName (must end with .pvd)
    if (!fileName || !fileName.toLowerCase().endsWith('.pvd')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_NAME',
          message: 'Invalid file name',
          details: 'File name must end with .pvd extension'
        }
      });
    }

    console.log(`[API] GET /api/project/${id}/pvd/${fileName} - Loading PV-Diagram data...`);

    // Get configuration
    const config = getConfig();
    const dataFolderPath = getDataFolderPath(config);

    // Scan directory to find matching project file (.det or .pou)
    const allFiles = await scanDirectory(dataFolderPath, ['.det', '.pou']);

    // Find file matching the ID
    let matchedFileInfo = null;
    for (const fileInfo of allFiles) {
      const fileId = normalizeFilenameToId(fileInfo.name);
      if (fileId === id) {
        matchedFileInfo = fileInfo;
        break;
      }
    }

    if (!matchedFileInfo) {
      console.warn(`[API] GET /api/project/${id}/pvd/${fileName} - Project not found`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          details: `No project found with ID: ${id}`
        }
      });
    }

    // Get project folder path (parent directory of the .det/.pou file)
    const projectFolderPath = path.dirname(matchedFileInfo.path);

    // Build full .pvd file path
    const pvdFilePath = path.join(projectFolderPath, fileName);

    // Check if file exists
    try {
      await readdir(projectFolderPath);
      const projectFiles = await readdir(projectFolderPath);
      if (!projectFiles.includes(fileName)) {
        console.warn(`[API] GET /api/project/${id}/pvd/${fileName} - File not found`);
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'PV-Diagram file not found',
            details: `File ${fileName} not found in project ${id}`
          }
        });
      }
    } catch (error) {
      console.error(`[API] Error checking file existence:`, error.message);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DIRECTORY_READ_ERROR',
          message: 'Failed to read project directory',
          details: error.message
        }
      });
    }

    // Parse .pvd file using PvdParser
    const startTime = Date.now();
    const pvdData = await parseEngineFile(pvdFilePath);
    const parseDuration = Date.now() - startTime;

    console.log(`[API] GET /api/project/${id}/pvd/${fileName} - Success (${parseDuration}ms, ${pvdData.data.length} points)`);

    // Build response
    res.json({
      success: true,
      data: pvdData,
      meta: {
        fileName: fileName,
        parseDuration: parseDuration,
        dataPoints: pvdData.data.length
      }
    });
  } catch (error) {
    console.error(`[API] GET /api/project/${req.params.id}/pvd/${req.params.fileName} - Error:`, error.message);

    // Check if error is due to parsing failure
    if (error.message && error.message.includes('слишком короткий')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_FORMAT',
          message: 'Invalid .pvd file format',
          details: error.message
        }
      });
    }

    // Pass other errors to global error handler
    next(error);
  }
});

export default router;

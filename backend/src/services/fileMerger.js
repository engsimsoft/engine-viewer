/**
 * File Merger Service - Merging .det and .pou data
 *
 * When both .det and .pou files exist with the same base name,
 * this service merges them to create a complete dataset with all 73 parameters:
 * - 71 parameters from .pou file (comprehensive data)
 * - 2 critical parameters from .det file: TCylMax, Convergence
 *
 * Result format: 'pou-merged'
 *
 * @module services/fileMerger
 */

/**
 * Merges .det and .pou data to create complete dataset (73 parameters)
 *
 * Strategy:
 * 1. Use .pou as base (71 parameters)
 * 2. Add TCylMax and Convergence from .det (2 parameters)
 * 3. Match calculations by ID
 * 4. Match data points by RPM
 * 5. Return merged project with format: 'pou-merged'
 *
 * @param {Object} pouProject - Parsed .pou project (71 params)
 * @param {Object} detProject - Parsed .det project (24 params)
 * @returns {Object} Merged project with format: 'pou-merged'
 * @throws {Error} If projects are incompatible
 *
 * @example
 * const pouData = await parseEngineFile('project.pou');
 * const detData = await parseEngineFile('project.det');
 * const merged = mergeDetPouData(pouData, detData);
 * // merged.format === 'pou-merged'
 * // merged.calculations[0].dataPoints[0].TCylMax // ✅ Available
 */
export function mergeDetPouData(pouProject, detProject) {
  // ========================================
  // 1. VALIDATION - Check compatibility
  // ========================================

  if (!pouProject || !detProject) {
    throw new Error('[FileMerger] Both pouProject and detProject are required');
  }

  if (pouProject.format !== 'pou') {
    throw new Error(`[FileMerger] First argument must be .pou project (got: ${pouProject.format})`);
  }

  if (detProject.format !== 'det') {
    throw new Error(`[FileMerger] Second argument must be .det project (got: ${detProject.format})`);
  }

  // Check metadata compatibility
  const pouMeta = pouProject.metadata;
  const detMeta = detProject.metadata;

  if (pouMeta.numCylinders !== detMeta.numCylinders) {
    throw new Error(
      `[FileMerger] Incompatible cylinder count: .pou has ${pouMeta.numCylinders}, .det has ${detMeta.numCylinders}`
    );
  }

  if (pouMeta.engineType !== detMeta.engineType) {
    console.warn(
      `[FileMerger] Engine type mismatch: .pou="${pouMeta.engineType}", .det="${detMeta.engineType}" - proceeding with merge`
    );
  }

  // ========================================
  // 2. CREATE MERGED PROJECT STRUCTURE
  // ========================================

  const mergedProject = {
    fileName: pouProject.fileName,
    format: 'pou-merged', // NEW FORMAT - indicates merged data
    metadata: pouProject.metadata, // Use .pou metadata (more complete)
    columnHeaders: pouProject.columnHeaders, // Use .pou headers
    calculations: []
  };

  // Create lookup map for .det calculations by ID
  const detCalculationsMap = new Map();
  for (const detCalc of detProject.calculations) {
    detCalculationsMap.set(detCalc.id, detCalc);
  }

  // ========================================
  // 3. MERGE CALCULATIONS
  // ========================================

  for (const pouCalc of pouProject.calculations) {
    const detCalc = detCalculationsMap.get(pouCalc.id);

    if (!detCalc) {
      console.warn(
        `[FileMerger] Calculation "${pouCalc.id}" exists in .pou but not in .det - skipping TCylMax/Convergence for this calculation`
      );

      // Add .pou calculation without .det data
      mergedProject.calculations.push({
        id: pouCalc.id,
        name: pouCalc.name,
        dataPoints: pouCalc.dataPoints // No merge, just copy .pou data
      });
      continue;
    }

    // Create lookup map for .det data points by RPM
    const detDataPointsMap = new Map();
    for (const detPoint of detCalc.dataPoints) {
      detDataPointsMap.set(detPoint.RPM, detPoint);
    }

    // Merge data points
    const mergedDataPoints = [];

    for (const pouPoint of pouCalc.dataPoints) {
      const detPoint = detDataPointsMap.get(pouPoint.RPM);

      if (!detPoint) {
        console.warn(
          `[FileMerger] RPM ${pouPoint.RPM} exists in .pou calculation "${pouCalc.id}" but not in .det - skipping TCylMax/Convergence for this RPM`
        );

        // Add .pou point without .det data
        mergedDataPoints.push(pouPoint);
        continue;
      }

      // MERGE: Add TCylMax, PCylMax, Deto, and Convergence from .det to .pou data
      const mergedPoint = {
        ...pouPoint,                       // All 71 .pou parameters
        TCylMax: detPoint.TCylMax,         // Add from .det (per-cylinder array)
        PCylMax: detPoint.PCylMax,         // Add from .det (per-cylinder array)
        Deto: detPoint.Deto,               // Add from .det (per-cylinder array)
        Convergence: detPoint.Convergence  // Add from .det (single value)
      };

      mergedDataPoints.push(mergedPoint);
    }

    // Add merged calculation
    mergedProject.calculations.push({
      id: pouCalc.id,
      name: pouCalc.name,
      dataPoints: mergedDataPoints
    });
  }

  // ========================================
  // 4. LOG MERGE RESULT
  // ========================================

  console.log(
    `[FileMerger] ✅ Successfully merged "${pouProject.fileName}": ${mergedProject.calculations.length} calculations, format: pou-merged (73 parameters)`
  );

  return mergedProject;
}

/**
 * Checks if two projects are compatible for merging
 *
 * @param {Object} pouProject - .pou project
 * @param {Object} detProject - .det project
 * @returns {boolean} true if projects can be merged
 */
export function areProjectsCompatible(pouProject, detProject) {
  if (!pouProject || !detProject) {
    return false;
  }

  if (pouProject.format !== 'pou' || detProject.format !== 'det') {
    return false;
  }

  // Check metadata compatibility
  const pouMeta = pouProject.metadata;
  const detMeta = detProject.metadata;

  if (pouMeta.numCylinders !== detMeta.numCylinders) {
    return false;
  }

  // Engine type mismatch is a warning, not an error
  return true;
}

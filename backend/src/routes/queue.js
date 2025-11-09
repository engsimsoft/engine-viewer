/**
 * Queue Status API Routes
 *
 * Provides real-time status of .prt parsing queue
 * Endpoint: GET /api/queue/status
 */

import express from 'express';

/**
 * Create queue status router
 * @param {PrtParsingQueue} prtQueue - Global PRT parsing queue instance
 * @returns {express.Router} Express router
 */
export function createQueueRouter(prtQueue) {
  const router = express.Router();

  /**
   * GET /api/queue/status
   * Returns current queue status
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "total": 35,
   *     "pending": 20,
   *     "completed": 15,
   *     "isProcessing": true
   *   }
   * }
   */
  router.get('/status', (req, res) => {
    try {
      const status = prtQueue.getStatus();

      res.json({
        success: true,
        data: {
          ...status,
          isProcessing: status.pending > 0
        }
      });
    } catch (error) {
      console.error('[Queue API] Error getting queue status:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get queue status',
          code: 'QUEUE_STATUS_ERROR'
        }
      });
    }
  });

  return router;
}

export default createQueueRouter;

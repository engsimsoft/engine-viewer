import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Queue status interface
 */
export interface QueueStatus {
  total: number;
  pending: number;
  completed: number;
  isProcessing: boolean;
}

/**
 * Hook for polling PRT parsing queue status
 *
 * Polls /api/queue/status every 2 seconds
 * Stops polling when pending === 0
 *
 * @returns Queue status or null if not loaded
 */
export function useQueueStatus() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [polling, setPolling] = useState(true);
  const previousPendingRef = useRef<number | null>(null);

  useEffect(() => {
    let ignore = false;
    let intervalId: number | null = null;

    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/queue/status');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!ignore) {
          if (data.success && data.data) {
            const newStatus = data.data;
            const previousPending = previousPendingRef.current;

            setStatus(newStatus);

            // Show toast when processing completes (pending goes from >0 to 0)
            if (previousPending !== null && previousPending > 0 && newStatus.pending === 0) {
              toast.success('All projects processed', {
                description: `Successfully processed ${newStatus.total} projects`,
              });
            }

            // Update previous pending value
            previousPendingRef.current = newStatus.pending;

            // Stop polling when queue is empty
            if (newStatus.pending === 0) {
              setPolling(false);
            }
          }
        }
      } catch (error) {
        if (!ignore) {
          console.error('[useQueueStatus] Error fetching queue status:', error);
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Start polling if enabled
    if (polling) {
      intervalId = setInterval(fetchStatus, 2000); // Poll every 2 seconds
    }

    // Cleanup
    return () => {
      ignore = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [polling]);

  return status;
}

import { useQueueStatus } from '@/hooks/useQueueStatus';

/**
 * Parsing Progress Bar
 *
 * Shows progress of background .prt file parsing
 * Automatically appears when parsing starts and hides when complete
 */
export default function ParsingProgress() {
  const status = useQueueStatus();

  // Don't show if no status or not processing
  if (!status || !status.isProcessing) {
    return null;
  }

  const percentage = status.total > 0 ? Math.round((status.completed / status.total) * 100) : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">
            Processing {status.completed}/{status.total} projects ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-blue-800 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

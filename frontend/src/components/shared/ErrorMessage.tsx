import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="w-6 h-6" />
        <p className="text-lg font-medium">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

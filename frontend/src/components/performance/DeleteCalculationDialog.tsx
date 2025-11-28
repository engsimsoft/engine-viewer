import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export interface DeleteCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculationName: string;
  onConfirm: () => Promise<void>;
}

/**
 * Confirmation dialog for deleting a calculation
 *
 * Features:
 * - Warning message
 * - Loading state
 * - Error display
 * - Cannot be undone warning
 */
export function DeleteCalculationDialog({
  open,
  onOpenChange,
  calculationName,
  onConfirm,
}: DeleteCalculationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete calculation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Calculation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete calculation "{calculationName}"?
            <br />
            <strong>This action cannot be undone.</strong> The calculation
            will be permanently removed from the project file.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

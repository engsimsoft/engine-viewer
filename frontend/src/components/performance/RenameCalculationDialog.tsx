import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export interface RenameCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (newId: string) => Promise<void>;
}

/**
 * Dialog for renaming a calculation (marker)
 *
 * Features:
 * - Input for new calculation name
 * - Auto-prepend $ if not present
 * - Validation (no tabs/newlines)
 * - Loading state
 * - Error display
 */
export function RenameCalculationDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
}: RenameCalculationDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewName(currentName);
      setError(null);
    }
  }, [open, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepend $ if not present
      const newId = newName.startsWith('$') ? newName : `$${newName}`;

      // Validate format
      if (newId.includes('\n') || newId.includes('\t')) {
        throw new Error('Marker ID cannot contain tabs or newlines');
      }

      if (newId.trim() === '$') {
        throw new Error('Marker ID cannot be empty');
      }

      await onRename(newId);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to rename calculation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Calculation</DialogTitle>
          <DialogDescription>
            Enter a new name for calculation "{currentName}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newName">New Name</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="baseline"
                autoFocus
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Will be saved as: {newName.startsWith('$') ? newName : `$${newName}`}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !newName.trim()}>
              {isLoading ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

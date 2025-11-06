import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TagInput } from '@/components/shared/TagInput';
import type { ProjectInfo } from '@/types';

// Zod validation schema (Metadata v1.0)
const metadataFormSchema = z.object({
  // Top-level fields
  displayName: z.string().max(200, 'Display name must not exceed 200 characters').optional(),

  // Manual metadata fields (user-editable)
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  client: z.string().max(200, 'Client name must not exceed 200 characters').optional(),
  tags: z.array(z.string()),
  status: z.enum(['active', 'completed', 'archived']),
  notes: z.string().optional(),
});

type MetadataFormValues = z.infer<typeof metadataFormSchema>;

export interface MetadataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectInfo | null;
  onSuccess?: () => void;
}

/**
 * MetadataDialog - диалог для создания/редактирования метаданных проекта
 *
 * Фичи:
 * - Форма с валидацией через react-hook-form + zod
 * - Все поля метаданных: описание, клиент, теги, статус, заметки, цвет
 * - Сохранение через Backend API
 * - Toast уведомления (успех/ошибка)
 */
export function MetadataDialog({ open, onOpenChange, project, onSuccess }: MetadataDialogProps) {
  // Форма с валидацией
  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: {
      displayName: '',
      description: '',
      client: '',
      tags: [],
      status: 'active',
      notes: '',
    },
  });

  // Обновление значений при изменении project (в useEffect!)
  useEffect(() => {
    if (project && open) {
      // Читаем данные из metadata v1.0 структуры
      const metadata = project.metadata;
      form.reset({
        // Top-level fields
        displayName: metadata?.displayName || project.displayName || '',

        // Manual metadata fields
        description: metadata?.manual?.description || '',
        client: metadata?.manual?.client || '',
        tags: metadata?.manual?.tags || [],
        status: metadata?.manual?.status || 'active',
        notes: metadata?.manual?.notes || '',
      });
    }
  }, [project, open, form]);

  // Отправка формы
  const onSubmit = async (values: MetadataFormValues) => {
    if (!project) return;

    try {
      // Prepare flat payload for backend (manual fields + displayName at top level)
      const payload = {
        displayName: values.displayName || undefined,
        description: values.description || undefined,
        client: values.client || undefined,
        tags: values.tags,
        status: values.status,
        notes: values.notes || undefined,
      };

      // Send to Backend API (flat structure, NO nested manual object)
      await axios.post(`/api/projects/${project.id}/metadata`, payload);

      // Success
      toast.success('Project metadata saved');
      onOpenChange(false);

      // Call callback to update data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error
      console.error('Failed to save metadata:', error);
      toast.error('Failed to save metadata');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project?.metadata ? 'Edit Metadata' : 'Add Metadata'}
          </DialogTitle>
          <DialogDescription>
            Project: <span className="font-medium">{project?.fileName}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ========== Section: Project Identity ========== */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  📋 Project Identity
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Basic project information
                </p>
              </div>

              {/* ID (readonly) */}
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  ID (readonly)
                </FormLabel>
                <FormControl>
                  <Input
                    value={project?.id || ''}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Project ID is generated from filename and cannot be changed
                </FormDescription>
              </FormItem>

              {/* Display Name (editable) */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Custom project name (optional)"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      If empty, project ID will be shown on cards
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ========== Section: Engine Configuration (if auto metadata exists) ========== */}
            {project?.metadata?.auto && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      🔧 Engine Configuration
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-extracted from .prt file (read-only)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Cylinders */}
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Cylinders</FormLabel>
                      <Input
                        value={project.metadata.auto.cylinders || '—'}
                        disabled
                        className="bg-muted text-sm h-9"
                      />
                    </FormItem>

                    {/* Type */}
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Type</FormLabel>
                      <Input
                        value={project.metadata.auto.type || '—'}
                        disabled
                        className="bg-muted text-sm h-9"
                      />
                    </FormItem>

                    {/* Configuration */}
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Configuration</FormLabel>
                      <Input
                        value={project.metadata.auto.configuration || '—'}
                        disabled
                        className="bg-muted text-sm h-9"
                      />
                    </FormItem>

                    {/* Intake System */}
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Intake</FormLabel>
                      <Input
                        value={project.metadata.auto.intakeSystem || '—'}
                        disabled
                        className="bg-muted text-sm h-9"
                      />
                    </FormItem>

                    {/* Valves */}
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Valves</FormLabel>
                      <Input
                        value={
                          project.metadata.auto.valvesPerCylinder &&
                          project.metadata.auto.inletValves &&
                          project.metadata.auto.exhaustValves
                            ? `${project.metadata.auto.valvesPerCylinder} (${project.metadata.auto.inletValves} In + ${project.metadata.auto.exhaustValves} Ex)`
                            : '—'
                        }
                        disabled
                        className="bg-muted text-sm h-9"
                      />
                    </FormItem>

                    {/* Bore × Stroke */}
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Bore × Stroke</FormLabel>
                      <Input
                        value={
                          project.metadata.auto.bore && project.metadata.auto.stroke
                            ? `${project.metadata.auto.bore} × ${project.metadata.auto.stroke} mm`
                            : '—'
                        }
                        disabled
                        className="bg-muted text-sm h-9"
                      />
                    </FormItem>

                    {/* Compression Ratio */}
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">CR</FormLabel>
                      <Input
                        value={
                          project.metadata.auto.compressionRatio
                            ? `${project.metadata.auto.compressionRatio}:1`
                            : '—'
                        }
                        disabled
                        className="bg-muted text-sm h-9"
                      />
                    </FormItem>

                    {/* Max Power RPM */}
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Max RPM</FormLabel>
                      <Input
                        value={
                          project.metadata.auto.maxPowerRPM
                            ? `${project.metadata.auto.maxPowerRPM} rpm`
                            : '—'
                        }
                        disabled
                        className="bg-muted text-sm h-9"
                      />
                    </FormItem>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* ========== Manual Metadata Fields ========== */}
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief project description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Client */}
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Input placeholder="Client or company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value}
                      onChange={field.onChange}
                      placeholder="Add tag..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field}) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed project notes..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

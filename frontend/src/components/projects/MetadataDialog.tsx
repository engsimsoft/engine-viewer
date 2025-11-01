import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';

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
import { TagInput } from '@/components/shared/TagInput';
import type { ProjectInfo } from '@/types';

// Zod validation schema
const metadataFormSchema = z.object({
  description: z.string().max(500, 'Description must not exceed 500 characters'),
  client: z.string().max(200, 'Client name must not exceed 200 characters'),
  tags: z.array(z.string()),
  status: z.enum(['active', 'completed', 'archived']),
  notes: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (must be HEX)'),
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
      description: '',
      client: '',
      tags: [],
      status: 'active',
      notes: '',
      color: '#3b82f6',
    },
  });

  // Обновление значений при изменении project (в useEffect!)
  useEffect(() => {
    if (project && open) {
      // Читаем данные из вложенного объекта metadata (если есть) или defaults
      const metadata = project.metadata || {};
      form.reset({
        description: metadata.description || '',
        client: metadata.client || '',
        tags: metadata.tags || [],
        status: metadata.status || 'active',
        notes: metadata.notes || '',
        color: metadata.color || '#3b82f6',
      });
    }
  }, [project, open, form]);

  // Отправка формы
  const onSubmit = async (values: MetadataFormValues) => {
    if (!project) return;

    try {
      // Send to Backend API
      await axios.post(`/api/projects/${project.id}/metadata`, values);

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

  // Color options
  const colorOptions = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#64748b', label: 'Gray' },
  ];

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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Label Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label Color</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input type="color" className="w-16 h-10" {...field} />
                    </FormControl>
                    <div className="flex gap-1">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className="w-8 h-8 rounded-full border-2 border-border hover:border-primary transition-colors"
                          style={{ backgroundColor: option.value }}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>
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

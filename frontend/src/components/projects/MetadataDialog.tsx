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

// Zod схема валидации
const metadataFormSchema = z.object({
  description: z.string().max(500, 'Описание не должно превышать 500 символов'),
  client: z.string().max(200, 'Название клиента не должно превышать 200 символов'),
  tags: z.array(z.string()),
  status: z.enum(['active', 'completed', 'archived']),
  notes: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат цвета (должен быть HEX)'),
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
      form.reset({
        description: project.description || '',
        client: project.client || '',
        tags: project.tags || [],
        status: project.status || 'active',
        notes: project.notes || '',
        color: project.color || '#3b82f6',
      });
    }
  }, [project, open, form]);

  // Отправка формы
  const onSubmit = async (values: MetadataFormValues) => {
    if (!project) return;

    try {
      // Отправка на Backend API
      const response = await axios.post(`/api/projects/${project.id}/metadata`, values);

      // Проверка успешного ответа
      if (response.status === 200 && response.data.metadata) {
        // Успех
        toast.success('Метаданные проекта сохранены');
        onOpenChange(false);

        // Вызов callback для обновления данных
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Ошибка
      console.error('Failed to save metadata:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`Ошибка: ${error.response.data.error || 'Не удалось сохранить метаданные'}`);
      } else {
        toast.error('Не удалось сохранить метаданные');
      }
    }
  };

  // Цвета для выбора
  const colorOptions = [
    { value: '#3b82f6', label: 'Синий' },
    { value: '#10b981', label: 'Зелёный' },
    { value: '#f59e0b', label: 'Оранжевый' },
    { value: '#ef4444', label: 'Красный' },
    { value: '#8b5cf6', label: 'Фиолетовый' },
    { value: '#ec4899', label: 'Розовый' },
    { value: '#64748b', label: 'Серый' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project?.description ? 'Редактировать метаданные' : 'Добавить метаданные'}
          </DialogTitle>
          <DialogDescription>
            Проект: <span className="font-medium">{project?.fileName}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Описание */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Input placeholder="Краткое описание проекта" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Клиент */}
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Клиент</FormLabel>
                  <FormControl>
                    <Input placeholder="Название клиента или компании" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Теги */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Теги</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value}
                      onChange={field.onChange}
                      placeholder="Добавить тег..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Статус */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Активный</SelectItem>
                      <SelectItem value="completed">Завершённый</SelectItem>
                      <SelectItem value="archived">Архивный</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Цвет метки */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цвет метки</FormLabel>
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

            {/* Заметки */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заметки</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Детальные заметки о проекте..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Кнопки */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

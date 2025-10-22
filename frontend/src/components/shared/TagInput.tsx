import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * TagInput - компонент для управления списком тегов
 *
 * Фичи:
 * - Добавление тегов по Enter или запятой
 * - Удаление тегов по клику на X
 * - Controlled component (управляется через props)
 */
export function TagInput({ tags, onChange, placeholder = 'Добавить тег...', className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  // Добавление нового тега
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  // Удаление тега
  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  // Обработка нажатия клавиш
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Enter или запятая - добавить тег
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
    // Backspace на пустом поле - удалить последний тег
    else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      const newTags = [...tags];
      newTags.pop();
      onChange(newTags);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Список тегов */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Удалить тег {tag}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Поле ввода */}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // При потере фокуса - добавить введённый текст как тег
          if (inputValue.trim()) {
            addTag(inputValue);
          }
        }}
        placeholder={placeholder}
      />

      {/* Подсказка */}
      <p className="text-xs text-muted-foreground">
        Нажмите Enter или запятую для добавления тега
      </p>
    </div>
  );
}

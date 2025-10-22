# Troubleshooting Guide

Руководство по решению проблем в Engine Results Viewer.

---

## 🔍 Содержание

- [React / Frontend проблемы](#react--frontend-проблемы)
  - [Infinite render loop](#infinite-render-loop)
  - [Metadata не загружается после сохранения](#metadata-не-загружается-после-сохранения)
  - [TypeScript verbatimModuleSyntax errors](#typescript-verbatimmodulesyntax-errors)
- [Backend проблемы](#backend-проблемы)
- [CORS проблемы](#cors-проблемы)
- [Performance проблемы](#performance-проблемы)

---

## React / Frontend проблемы

### Infinite render loop

**Симптомы:**
- При открытии компонента (например, Dialog) браузер зависает
- React DevTools показывает тысячи обновлений
- Console warning: `"Maximum update depth exceeded"`
- Браузер становится неотзывчивым

**Причина:**
Вызов state-изменяющих функций напрямую во время рендера (не в useEffect, обработчике события или другом побочном эффекте).

**Пример проблемного кода:**
```typescript
export function MetadataDialog({ project, open }: Props) {
  const form = useForm<MetadataFormValues>({...});

  // ❌ НЕПРАВИЛЬНО: Вызов form.reset() во время рендера
  if (project && open) {
    form.reset({
      description: project.description || '',
      // ...
    });
  }

  return <Dialog>...</Dialog>;
}
```

**Почему это вызывает цикл:**
1. Компонент рендерится
2. `form.reset()` вызывается → изменяет состояние формы
3. Изменение состояния → новый рендер
4. Повторяется бесконечно

**Решение:**
Переместить `form.reset()` в useEffect с правильными зависимостями.

```typescript
export function MetadataDialog({ project, open }: Props) {
  const form = useForm<MetadataFormValues>({...});

  // ✅ ПРАВИЛЬНО: Вызов в useEffect
  useEffect(() => {
    if (project && open) {
      form.reset({
        description: project.description || '',
        // ...
      });
    }
  }, [project, open, form]); // Зависимости важны!

  return <Dialog>...</Dialog>;
}
```

**Ключевые моменты:**
- ✅ Побочные эффекты (state updates) → useEffect
- ✅ Правильные зависимости в массиве deps
- ✅ Условие `if` внутри useEffect для защиты от undefined
- ❌ НЕ вызывать state-изменяющие функции в теле компонента

**Связанные документы:**
- [React docs: useEffect](https://react.dev/reference/react/useEffect)
- [React docs: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

**Файлы проекта:**
- `frontend/src/components/projects/MetadataDialog.tsx:80-93`

---

### Metadata не загружается после сохранения

**Симптомы:**
- Метаданные сохраняются успешно (Toast показывает "Сохранено")
- После закрытия и повторного открытия диалога поля пустые
- Backend логи показывают успешный POST запрос
- Файл `.metadata/<project-id>.json` существует и содержит данные

**Причина:**
Несоответствие структуры данных между backend response и frontend чтением.

**Детали проблемы:**

Backend возвращает метаданные в **вложенном объекте** `metadata`:
```json
{
  "id": "bmw-m42",
  "name": "BMW M42",
  "fileName": "BMW M42.det",
  "metadata": {          // ← Вложенный объект
    "description": "Ральная BMW на ресивере",
    "client": "",
    "tags": [],
    "status": "active",
    "color": "#3b82f6"
  }
}
```

Frontend пытался читать из **плоских полей**:
```typescript
// ❌ НЕПРАВИЛЬНО: project.description не существует!
form.reset({
  description: project.description || '',  // undefined
  client: project.client || '',            // undefined
  tags: project.tags || [],                // undefined
  // ...
});
```

**Решение:**
Читать данные из вложенного объекта `project.metadata`.

```typescript
// ✅ ПРАВИЛЬНО: Читаем из project.metadata
useEffect(() => {
  if (project && open) {
    const metadata = project.metadata || {}; // Защита от null
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
```

**Как диагностировать:**
1. Открыть Chrome DevTools → Network
2. Найти запрос GET `/api/projects`
3. Проверить Response JSON:
   ```json
   {
     "data": [
       {
         "id": "bmw-m42",
         "metadata": { ... } // ← Проверь что metadata здесь
       }
     ]
   }
   ```
4. Открыть React DevTools → Components → MetadataDialog
5. Проверить props.project:
   - Есть ли `project.metadata`?
   - Или данные в плоских полях `project.description`?

**Проверка на backend:**
```bash
# Проверить что файл метаданных существует
cat .metadata/bmw-m42.json

# Должен вернуть JSON с данными
{
  "description": "...",
  "client": "...",
  ...
}
```

**TypeScript защита:**
Обнови интерфейс `ProjectInfo` чтобы отразить реальную структуру:
```typescript
export interface ProjectInfo {
  id: string;
  name: string;
  fileName: string;
  // ... другие поля

  // ✅ Правильная структура
  metadata?: {                // Вложенный объект (опциональный)
    description?: string;
    client?: string;
    tags?: string[];
    status?: 'active' | 'completed' | 'archived';
    color?: string;
    notes?: string;
    updatedAt?: string;
  };

  // ❌ Плоские поля (устаревший подход)
  // description?: string;
  // client?: string;
}
```

**Связанные файлы:**
- Backend: `backend/src/routes/projects.js:119` (формирование response)
- Frontend: `frontend/src/components/projects/MetadataDialog.tsx:83-91`
- Types: `frontend/src/types/index.ts:109-117`

**Важно:**
Эта проблема проявляется только при **загрузке** метаданных. Сохранение работает корректно, т.к. POST запрос отправляет правильную структуру данных.

---

### TypeScript verbatimModuleSyntax errors

**Симптомы:**
```
error TS1484: 'KeyboardEvent' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

**Причина:**
TypeScript конфигурация использует `verbatimModuleSyntax: true`, что требует явного разделения type imports и value imports.

**Пример проблемного кода:**
```typescript
// ❌ НЕПРАВИЛЬНО
import { KeyboardEvent } from 'react';  // KeyboardEvent это тип, не значение

function handleKeyDown(e: KeyboardEvent) {
  // ...
}
```

**Решение:**
Использовать `import type` для импорта типов.

```typescript
// ✅ ПРАВИЛЬНО
import type { KeyboardEvent } from 'react';

function handleKeyDown(e: KeyboardEvent) {
  // ...
}
```

**Почему это важно:**
- `verbatimModuleSyntax` улучшает совместимость с ESM
- Помогает избежать проблем с bundling
- Явно показывает что импортируется: тип или значение

**Другие примеры:**
```typescript
// ❌ НЕПРАВИЛЬНО
import { ChangeEvent, useState } from 'react';

// ✅ ПРАВИЛЬНО - разделить type и value imports
import { useState } from 'react';
import type { ChangeEvent } from 'react';

// ИЛИ можно в одной строке
import { useState, type ChangeEvent } from 'react';
```

**Связанные файлы:**
- `tsconfig.json` (содержит `verbatimModuleSyntax: true`)
- `frontend/src/components/shared/TagInput.tsx`
- `frontend/src/components/projects/MetadataDialog.tsx`
- `frontend/src/api/client.ts`

**TypeScript documentation:**
- [verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)

---

## Backend проблемы

### Coming soon
Backend проблемы будут документироваться по мере возникновения.

---

## CORS проблемы

### Coming soon
CORS проблемы будут документироваться по мере возникновения.

---

## Performance проблемы

### Coming soon
Performance проблемы будут документироваться по мере возникновения.

---

## 💡 Общие рекомендации

### Как диагностировать проблему

1. **Читай error messages внимательно**
   - React warnings часто точно указывают на проблему
   - TypeScript ошибки содержат номера строк

2. **Используй DevTools**
   - Chrome DevTools → Network (API запросы)
   - React DevTools → Components (props, state)
   - Console (warnings, errors)

3. **Изучай официальную документацию**
   - НЕ гугли сразу
   - Сначала читай официальные docs через WebFetch
   - Проверяй актуальность (дата обновления)

4. **Проверяй предположения**
   - Логируй данные: `console.log(project)`
   - Проверяй структуру: `console.log(JSON.stringify(data, null, 2))`
   - Используй debugger: `debugger;`

5. **Изолируй проблему**
   - Работает ли backend отдельно? (curl)
   - Работает ли компонент отдельно? (Storybook)
   - Проблема в данных или в UI?

### Чек-лист перед добавлением в troubleshooting.md

При обнаружении новой проблемы, задокументируй:
- [ ] **Симптомы**: Что видит пользователь
- [ ] **Причина**: Root cause проблемы
- [ ] **Решение**: Как исправить (с примерами кода)
- [ ] **Как диагностировать**: Шаги для воспроизведения
- [ ] **Связанные файлы**: Ссылки на код
- [ ] **Ссылки на документацию**: Официальные docs

---

## 📚 Полезные ссылки

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [react-hook-form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

**Обновление:** 22 октября 2025
**Версия:** 1.0
**Следующее обновление:** После обнаружения новых проблем в Этапе 7+

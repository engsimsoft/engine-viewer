# ADR 010: Cross-Project Comparison Feature

**Дата:** 7 ноября 2025
**Статус:** Принято
**Автор:** User + Claude Code

---

## Контекст

Пользователь хочет сравнивать результаты расчётов (calculations) из разных проектов на одном графике для анализа:
- Сравнение разных конфигураций двигателя (ITB vs IM, разные выпускные системы)
- Анализ влияния изменений параметров
- Before/After сравнение после доработок
- Выбор оптимальной конфигурации

**Проблема:** Как организовать UI и данные для сравнения нескольких проектов?

**Требования:**
- Визуально различать расчёты из разных проектов
- Легко добавлять/удалять проекты для сравнения
- Не перегружать график (performance, читаемость)
- Сохранять выбор при переключении между пресетами

---

## Решение

**1 primary project + up to 4 comparison projects** (max 5 projects total на графике)

**Компоненты:**
- **ComparisonSelector** - dropdown для выбора проектов для сравнения
- **CalculationSelector** - фильтр показывает проект каждого расчёта
- **Zustand store** - хранит выбранные comparison projects + primary project
- **Chart presets** - отображают calculations из всех выбранных проектов

**Визуальное разделение:**
- Каждый проект = свой цвет (из palette)
- Calculation name = "ProjectName - $N" или "ProjectName - CalcName"
- Legend показывает проект каждой линии

---

## Причины

### 1. Limit 5 projects (1 primary + 4 comparisons)

**Почему не unlimited:**
- ⚠️ Performance: 5 projects × 5 calculations each = 25 lines на графике (предел читаемости)
- ⚠️ Palette exhaustion: У нас 10 цветов в palette, но 5 проектов × 2-3 calculation каждый = уже 10-15 линий
- ⚠️ Cognitive overload: Больше 5 проектов одновременно = нечитаемый график
- ✅ Real use case: На практике сравнивают 2-3 конфигурации, редко больше

**Почему не 3 projects:**
- ❌ Слишком ограничивающе
- ✅ 5 projects = golden mean (достаточно для real use cases, не перегружает)

### 2. Primary + Comparison pattern

**Почему не "равноправные" проекты:**
- ✅ Ясный базовый проект (primary) = baseline для сравнения
- ✅ Primary project всегда показан → контекст не теряется
- ✅ UX: "Open project" → primary, "Add comparisons" → добавить comparison projects

**Альтернатива (все равноправные):**
- ❌ Нет baseline
- ❌ При "Open project" нужно решать что делать с текущими проектами (replace? add?)
- ❌ Сложнее mental model

### 3. Zustand state management

**Почему Zustand:**
- ✅ Уже используется для unit conversion state
- ✅ Легковесный (1KB)
- ✅ Persist to localStorage → выбор сохраняется между сессиями
- ✅ Devtools support

**Альтернатива (React Context):**
- ❌ Больше boilerplate
- ❌ Нет persist to localStorage "из коробки"
- ❌ Хуже DevTools experience

---

## Последствия

### Плюсы:
- ✅ Пользователь может сравнить до 5 проектов одновременно
- ✅ Читаемые графики (не перегружены)
- ✅ Ясная иерархия: Primary (baseline) + Comparisons
- ✅ State сохраняется между сессиями (localStorage)
- ✅ Работает со всеми 6 chart presets
- ✅ Performance: 5 projects = manageable data volume

### Минусы:
- ⚠️ Limit 5 projects может быть недостаточно в редких случаях (но можно увеличить в будущем)
- ⚠️ Palette может исчерпаться если много calculations (но редко на практике)
- ⚠️ Требуется управлять state (но Zustand делает это easy)

---

## Альтернативы

### Unlimited projects
- **Плюсы**: Нет ограничений
- **Минусы**: Performance issues, нечитаемые графики, palette exhaustion
- **Вердикт**: Отклонено (5 projects достаточно для real use cases)

### Single project only (no comparison)
- **Плюсы**: Простейшая реализация
- **Минусы**: Нет возможности сравнить конфигурации → критическая потеря функционала
- **Вердикт**: Отклонено (comparison - core feature для инженерного анализа)

### Overlay mode (switch between projects, overlay lines)
- **Плюсы**: Нет limit на количество проектов
- **Минусы**: Сложный UX, нужно manually toggle каждый проект, легко потерять контекст
- **Вердикт**: Отклонено (worse UX than multi-select)

### All projects always visible (no selection)
- **Плюсы**: Всегда все видно
- **Минусы**: Performance nightmare (50+ projects × 20 calculations = 1000 lines), невозможно читать
- **Вердикт**: Отклонено (completely unusable)

---

## Реализация

**Frontend Components:**
- `frontend/src/components/ProjectPage/ComparisonSelector.tsx` - dropdown для выбора comparison projects
- `frontend/src/components/ProjectPage/CalculationSelector.tsx` - показывает calculations из всех проектов
- `frontend/src/components/charts/*.tsx` - все 6 chart presets поддерживают comparison data

**State Management:**
- `frontend/src/store/projectStore.ts` (Zustand) - хранит:
  ```typescript
  {
    primaryProjectId: string;
    comparisonProjectIds: string[];  // max 4 items
  }
  ```

**API:**
- Используем существующий `GET /api/project/:id` для каждого проекта
- Фронт делает параллельные запросы для comparison projects

**Data Flow:**
1. User opens project → becomes primary
2. User selects comparison projects (up to 4)
3. Frontend fetches all selected projects (parallel requests)
4. Merge calculations from all projects
5. Color-code by project
6. Render on chart

---

## Ссылки

- [ProjectPage Implementation](../../frontend/src/pages/ProjectPage.tsx)
- [ComparisonSelector Component](../../frontend/src/components/ProjectPage/ComparisonSelector.tsx)
- [Zustand Store](../../frontend/src/store/projectStore.ts)
- [AUDIT-FINDINGS.md](../../AUDIT-FINDINGS.md) (Section: Cross-Project Comparison реализовано)

---

## Примечания

- **Performance considerations:** 5 projects × 20 calculations × 30 data points each = 3000 points total (manageable for ECharts)
- **Future expansion:** Можно увеличить limit до 7-8 projects если потребуется, но сначала нужно добавить больше цветов в palette
- **Bundle size:** Нет дополнительных зависимостей (используем существующий Zustand)
- **Testing:** Протестировано на реальных проектах (BMW M42, 4_Cyl_ITB, Vesta 1.6 IM)

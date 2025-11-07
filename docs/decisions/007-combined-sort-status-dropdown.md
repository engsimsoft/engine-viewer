# ADR 007: Combined Sort & Status Dropdown UI Pattern

**Дата:** 7 ноября 2025
**Статус:** Принято
**Автор:** User + Claude Code

---

## Контекст

HomePage Dashboard показывает карточки всех проектов (50+ в production). Пользователю нужны:
1. **Сортировка:** По дате, названию, количеству расчётов
2. **Фильтрация по статусу:** active, completed, archived, testing
3. **UI constraint:** Ограниченное пространство в FiltersBar (mobile + desktop)

**Проблема:** Как организовать UI для сортировки + фильтрации статуса чтобы:
- Не занимать много места (особенно на mobile)
- Быть интуитивным
- Поддерживать комбинированные действия (sort + filter status)

**Альтернативы UI:**
- Два отдельных dropdown (Sort + Status)
- Combined dropdown (одна кнопка)
- Tabs для сортировки + dropdown для статуса
- Search bar с advanced filters

---

## Решение

**Combined Sort & Status Dropdown** - одна кнопка открывает dropdown с двумя секциями:
1. **Sort Options:** Date (newest first), Date (oldest first), Name (A-Z), Name (Z-A), Calculations (most first)
2. **Status Filter:** All, Active, Completed, Archived, Testing

**UI:**
```
┌──────────────────────────┐
│ [▼] Sort & Filter        │  ← Combined button
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Sort by:                 │
│ • Date (newest first) ✓  │
│ • Date (oldest first)    │
│ • Name (A-Z)             │
│ • Name (Z-A)             │
│ • Calculations           │
│ ─────────────────────    │
│ Status:                  │
│ • All ✓                  │
│ • Active                 │
│ • Completed              │
│ • Archived               │
│ • Testing                │
└──────────────────────────┘
```

**Поведение:**
- Click на option → apply immediately → dropdown остаётся открытым
- Current selection показана checkmark (✓)
- ESC / click outside → закрыть dropdown
- Независимые секции: можно выбрать sort + status filter одновременно

---

## Причины

### 1. Combined vs Separate Dropdowns

**Почему Combined:**
- ✅ Экономит место в FiltersBar (особенно важно на mobile)
- ✅ Меньше UI elements → cleaner interface
- ✅ Sort + Status логически связаны (оба про "как показывать проекты")
- ✅ Reduce visual clutter (4 filters + search + combined button = 6 elements вместо 7)

**Почему не Separate:**
- ❌ Занимает больше места (2 кнопки вместо 1)
- ❌ Visual clutter на mobile (FiltersBar переполнена)
- ❌ Менее cohesive UX (две кнопки для связанных действий)

### 2. Dropdown остаётся открытым после выбора

**Почему не закрывать:**
- ✅ Пользователь может быстро попробовать разные сортировки
- ✅ Можно выбрать sort + status без повторного открытия
- ✅ Меньше clicks (не нужно reopening dropdown)

**Почему не делать modal:**
- ❌ Модал = blocking UI
- ❌ Dropdown = lighter interaction

### 3. Независимые секции (sort + status)

**Почему независимые:**
- ✅ Flexibility: можно sort по дате + filter only active projects
- ✅ Clear separation: Sort (ordering) vs Status (filtering) - разные concerns
- ✅ State management проще (два независимых state variables)

**Альтернатива (radio buttons для combined options):**
- ❌ Combinatorial explosion: 5 sort options × 5 status options = 25 radio buttons
- ❌ Impossible UX

---

## Последствия

### Плюсы:
- ✅ Экономит место в FiltersBar (~50px width на mobile)
- ✅ Cleaner UI (меньше кнопок)
- ✅ Быстрый workflow: select sort → select status → done (без reopening dropdown)
- ✅ Responsive: работает на mobile (320px width) и desktop (1920px+)
- ✅ Accessibility: keyboard navigation (Tab, Enter, ESC)

### Минусы:
- ⚠️ Slightly more complex implementation (dropdown with 2 sections vs 2 simple dropdowns)
- ⚠️ Менее явно что в одной кнопке два действия (но label "Sort & Filter" помогает)
- ⚠️ На первый взгляд может быть неочевидно что dropdown multi-select (но checkmarks помогают)

---

## Альтернативы

### Two separate dropdowns (Sort + Status)
- **Плюсы**: Явное разделение concerns, привычный pattern
- **Минусы**: Занимает больше места, visual clutter на mobile
- **Вердикт**: Отклонено (space constraint на mobile критичен)

### Tabs для Sort + Dropdown для Status
- **Плюсы**: Визуально раздельные concerns
- **Минусы**: Tabs занимают ещё больше места, сложнее implementation
- **Вердикт**: Отклонено (overengineering для простой задачи)

### Search bar с advanced filters (pop-up modal)
- **Плюсы**: Power-user feature, unlimited filter options
- **Минусы**: Blocking UI, overwhelming для simple use case, slow workflow
- **Вердикт**: Отклонено (too heavy для sorting + status filtering)

### Single dropdown с radio buttons (all combinations)
- **Плюсы**: One selection = done
- **Минусы**: 25 options (5 sort × 5 status), unmanageable
- **Вердикт**: Отклонено (completely unusable)

### Always visible sort buttons + status dropdown
- **Плюсы**: Zero-click sorting
- **Минусы**: Занимает огромное место, не работает на mobile
- **Вердикт**: Отклонено (mobile is priority)

---

## Реализация

**Frontend Component:**
- `frontend/src/components/HomePage/FiltersBar.tsx` - содержит Combined dropdown
- `frontend/src/components/HomePage/SortStatusDropdown.tsx` - combined dropdown component

**State Management:**
- Local React state (не Zustand):
  ```typescript
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  ```
- Не нужен global state (sort + status filter = local UI state для HomePage)

**Styling:**
- TailwindCSS
- Dropdown: `absolute` positioning, `z-50`
- Mobile-first: button width responsive (full width на mobile, auto на desktop)
- Checkmarks (✓) для current selection

**Accessibility:**
- Keyboard: Tab (focus), Enter (select), ESC (close)
- ARIA: `role="menu"`, `aria-expanded`, `aria-label`
- Focus indicators (blue ring)

---

## Ссылки

- [FiltersBar Component](../../frontend/src/components/HomePage/FiltersBar.tsx)
- [HomePage Implementation](../../frontend/src/pages/HomePage.tsx)
- [UI Screenshot](../../docs/screenshots/filters-bar.png) (если есть)
- [AUDIT-FINDINGS.md](../../AUDIT-FINDINGS.md) (Section: HomePage Dashboard - Combined Sort/Status dropdown)

---

## Примечания

- **Mobile constraint:** FiltersBar на iPhone SE (320px width) критичен → Combined dropdown спасает ~50px
- **Future expansion:** Можно добавить больше sort options (по количеству цилиндров, по типу) без переделки UI
- **Performance:** Dropdown рендерится always (не lazy) но это OK т.к. легковесный (20 lines of options)
- **Design decision:** Checkmarks (✓) вместо radio buttons → визуально легче, особенно на mobile
- **User feedback:** "Sort & Filter" label помогает понять что в одной кнопке два действия

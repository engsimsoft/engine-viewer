# 🗺️ Roadmap: Performance & Efficiency Header + Help Page

**Дата создания:** 2 ноября 2025
**Статус:** 🚧 In Progress
**Версия:** 1.0

---

## 🎯 Цель

Упростить header страницы визуализации и добавить Help страницу с полной документацией по всем 29 параметрам двигателя.

---

## 📊 Общий прогресс

**Завершено:** 16 / 35 задач (46%)

- [X] Phase 1: Header Refactoring (5/5) ✅ Git: fe99c16
- [X] Phase 2: Help Page - Basic Structure (6/6) ✅ Git: ce22cf6
- [X] Phase 3: Help Page - Parameters Display (5/5) ✅ Git: f897d1c
- [ ] Phase 4: Help Page - Tooltips (0/5)
- [ ] Phase 5: Help Page - Search (0/5)
- [ ] Phase 6: Help Page - Dynamic Units (0/5)
- [ ] Phase 7: Final Testing & Polish (0/7)

---

## Phase 1: Header Refactoring ✅ COMPLETED (Git: fe99c16)

**Цель:** Убрать дублирование информации из header, добавить кнопку Help

**Задачи:**

### 1.1 Refactor Header.tsx ✅

**Файл:** `frontend/src/components/visualization/Header.tsx`

- [X] Убрать props: `projectName`, `engineType`, `cylinders`, `calculationsCount`
- [X] Изменить interface `HeaderProps` (убрать все props)
- [X] Заменить центральную секцию на статический заголовок
- [X] Изменить layout: `[← Back] [Performance & Efficiency] [PNG][SVG][Help][⚙️]`

**Ожидаемый результат:**
```tsx
export function Header() {
  // No props needed
  return (
    <header>
      {/* Left: Back button */}
      {/* Center: "Performance & Efficiency" static title */}
      {/* Right: PNG, SVG, Help, Settings */}
    </header>
  );
}
```

---

### 1.2 Add Help button to Header ✅

**Файл:** `frontend/src/components/visualization/Header.tsx`

- [X] Import `HelpCircle` icon from `lucide-react`
- [X] Import `useNavigate` from `react-router-dom`
- [X] Добавить кнопку между SVG и Settings
- [X] Добавить onClick handler: `navigate('/help')`
- [X] Styling: consistent with PNG/SVG buttons

**Код:**
```tsx
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// In component:
const navigate = useNavigate();

<Button
  variant="outline"
  size="sm"
  onClick={() => navigate('/help')}
  title="View parameters documentation"
  className="gap-2"
>
  <HelpCircle className="h-4 w-4" />
  <span className="hidden sm:inline">Help</span>
</Button>
```

---

### 1.3 Update ProjectPage.tsx ✅

**Файл:** `frontend/src/pages/ProjectPage.tsx`

- [X] Найти где используется `<Header ... />`
- [X] Убрать все props передаваемые в Header
- [X] Было: `<Header projectName={project.name} engineType={...} ... />`
- [X] Станет: `<Header />`

---

### 1.4 Test: Verify header displays correctly ✅

**Manual Testing Checklist:**

- [X] Запустить dev server: `npm run dev`
- [X] Открыть любой проект (например, Vesta 1.6 IM)
- [X] **Проверить:** Заголовок "Performance & Efficiency" отображается по центру
- [X] **Проверить:** Back button работает (возврат на HomePage)
- [X] **Проверить:** Help button появился между SVG и Settings
- [X] **Проверить:** PNG button работает
- [X] **Проверить:** SVG button работает
- [X] **Проверить:** Settings button работает
- [X] **Проверить:** Нет console errors или warnings
- [X] **Проверить:** Responsive design (mobile, tablet, desktop)

---

### 1.5 Git commit ✅

**Команды:**
```bash
git add frontend/src/components/visualization/Header.tsx
git add frontend/src/pages/ProjectPage.tsx
git commit -m "refactor: simplify Header with Performance & Efficiency title

- Remove project metadata props from Header component
- Add static 'Performance & Efficiency' title
- Add Help button for navigation to /help page
- Update ProjectPage to use simplified Header

Related to roadmap: docs/tasks/performance-efficiency-header-roadmap.md"
```

- [X] Git commit выполнен (fe99c16)
- [X] Commit message информативный

---

## Phase 2: Help Page - Basic Structure ✅ COMPLETED (Git: ce22cf6)

**Цель:** Создать базовую структуру HelpPage с роутингом

**Задачи:**

### 2.1 Create HelpPage.tsx ✅

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [X] Создать новый файл в `frontend/src/pages/`
- [X] Импорты: React, useNavigate, PARAMETERS
- [X] Базовая структура компонента
- [X] Export default HelpPage

**Шаблон:**
```tsx
import { useNavigate } from 'react-router-dom';
import { PARAMETERS } from '@/config/parameters';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* Title Section */}
      {/* Content */}
    </div>
  );
}
```

---

### 2.2 Add Back button and title section ✅

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [X] Header с Back button: `← Back to Visualization`
- [X] Back button action: `navigate(-1)` (возврат на предыдущую страницу)
- [X] Main title: "Parameters Reference"
- [X] Subtitle: "Complete guide to all 29 engine parameters"

**Код:**
```tsx
{/* Header */}
<header className="border-b bg-background">
  <div className="container mx-auto px-4 py-4">
    <Button
      variant="ghost"
      onClick={() => navigate(-1)}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Visualization
    </Button>
  </div>
</header>

{/* Title Section */}
<div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold">Parameters Reference</h1>
  <p className="text-muted-foreground mt-2">
    Complete guide to all 29 engine parameters
  </p>
</div>
```

---

### 2.3 Create parameter list layout (grouped by category) ✅

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [X] Import `PARAMETERS` from `@/config/parameters`
- [X] Создать функцию группировки параметров по `category`
- [X] 3 секции: Global Parameters, Per-Cylinder Parameters, Vibe Combustion Model
- [X] Заголовки секций с иконками (placeholder for Phase 3)

**Код:**
```tsx
// Group parameters by category
const globalParams = Object.values(PARAMETERS).filter(p => p.category === 'global');
const perCylinderParams = Object.values(PARAMETERS).filter(p => p.category === 'per-cylinder');
const vibeParams = Object.values(PARAMETERS).filter(p => p.category === 'vibe-model');

// In JSX:
<div className="space-y-8">
  {/* Global Parameters */}
  <section>
    <h2 className="text-2xl font-semibold mb-4">🔷 Global Parameters</h2>
    {/* Parameter list */}
  </section>

  {/* Per-Cylinder Parameters */}
  <section>
    <h2 className="text-2xl font-semibold mb-4">🔷 Per-Cylinder Parameters</h2>
    {/* Parameter list */}
  </section>

  {/* Vibe Combustion Model */}
  <section>
    <h2 className="text-2xl font-semibold mb-4">🔷 Vibe Combustion Model</h2>
    {/* Parameter list */}
  </section>
</div>
```

---

### 2.4 Add /help route to App.tsx ✅

**Файл:** `frontend/src/App.tsx`

- [X] Import `HelpPage` component
- [X] Добавить route: `<Route path="/help" element={<HelpPage />} />`
- [X] Проверить порядок routes (более специфичные раньше)

**Код:**
```tsx
import HelpPage from '@/pages/HelpPage';

// In <Routes>:
<Route path="/" element={<HomePage />} />
<Route path="/project/:id" element={<ProjectPage />} />
<Route path="/help" element={<HelpPage />} />
```

---

### 2.5 Test: Verify page renders and navigation works ✅

**Manual Testing Checklist:**

- [X] Запустить dev server
- [X] Открыть любой проект
- [X] **Проверить:** Нажать Help button → переход на `/help`
- [X] **Проверить:** URL изменился на `/help`
- [X] **Проверить:** Заголовок "Parameters Reference" отображается
- [X] **Проверить:** Subtitle отображается
- [X] **Проверить:** Placeholder для параметров отображается
- [X] **Проверить:** Back button → возврат на ProjectPage
- [X] **Проверить:** Состояние сохранилось (selected calculation, units, etc.)
- [X] **Проверить:** Нет console errors

---

### 2.6 Git commit ✅

**Команды:**
```bash
git add frontend/src/pages/HelpPage.tsx
git add frontend/src/App.tsx
git commit -m "feat: add HelpPage with basic structure

- Create HelpPage component with layout
- Add Back button and title section
- Group parameters by category (global, per-cylinder, vibe-model)
- Add /help route to App.tsx

Related to roadmap: docs/tasks/performance-efficiency-header-roadmap.md"
```

- [X] Git commit выполнен (ce22cf6)
- [X] Commit message информативный

---

## Phase 3: Help Page - Parameters Display ✅ COMPLETED (Git: f897d1c)

**Цель:** Отобразить все 29 параметров с метаданными

**Задачи:**

### 3.1 Implement parameters grouping by category ✅

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [X] Создать helper function `groupParametersByCategory()`
- [X] Фильтровать параметры по `category` (включая новую категорию `mep`)
- [X] Добавлена категория MEP для Mean Effective Pressure параметров

**Код:**
```tsx
function groupParametersByCategory() {
  const params = Object.values(PARAMETERS);

  return {
    global: params.filter(p => p.category === 'global'),
    perCylinder: params.filter(p => p.category === 'per-cylinder'),
    vibeModel: params.filter(p => p.category === 'vibe-model'),
  };
}
```

---

### 3.2 Display parameter metadata ✅

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [X] Создать компонент `ParameterRow`
- [X] Display: `displayName` (bold, larger font)
- [X] Display: `name` (code style, monospace)
- [X] Display: `brief` (description text)
- [X] Display: `unit` (badge или inline)

**Структура:**
```tsx
interface ParameterRowProps {
  param: ParameterMetadata;
}

function ParameterRow({ param }: ParameterRowProps) {
  return (
    <div className="flex items-start justify-between py-3 border-b">
      <div className="flex-1">
        {/* displayName */}
        <h3 className="font-semibold text-lg">{param.displayName}</h3>

        {/* name (code style) */}
        <code className="text-sm text-muted-foreground">{param.name}</code>

        {/* brief */}
        <p className="text-sm mt-1">{param.brief}</p>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* unit */}
        <span className="text-sm text-muted-foreground">{param.unit}</span>

        {/* Info icon (Phase 4) */}
      </div>
    </div>
  );
}
```

---

### 3.3 Add Info icon for each parameter ✅

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [X] Import `Info` icon from `lucide-react`
- [X] Добавить Info icon справа от каждого параметра
- [X] Styling: subtle color, hover effect
- [X] Placeholder для tooltip (будет в Phase 4)

**Код:**
```tsx
import { Info } from 'lucide-react';

// In ParameterRow:
<Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
```

---

### 3.4 Test: Verify all 29 parameters display correctly ✅

**Manual Testing Checklist:**

- [X] Открыть `/help` страницу
- [X] **Проверить:** Global Parameters section (7 параметров)
  - RPM, P-Av, Torque, Convergence, TexAv, Timing, TAF
- [X] **Проверить:** Mean Effective Pressure (MEP) section (4 параметра)
  - FMEP, IMEP, BMEP, PMEP
- [X] **Проверить:** Per-Cylinder Parameters section (14 параметров)
  - PCylMax, Deto, TCylMax, TUbMax, PurCyl, Power, DRatio, Seff, Teff, Ceff, BSFC, TC-Av, MaxDeg, Delay, Durat
- [X] **Проверить:** Vibe Combustion Model section (4 параметра)
  - VibeDelay, VibeDurat, VibeA, VibeM
- [X] **Проверить:** Каждый параметр показывает displayName, name, brief, unit
- [X] **Проверить:** Info icon появился у каждого параметра
- [X] **Проверить:** Layout читабельный
- [X] **Проверить:** Responsive design работает
- [X] **Проверить:** Нет console errors

---

### 3.5 Git commit ✅

**Команды:**
```bash
git add frontend/src/config/parameters.ts frontend/src/pages/HelpPage.tsx
git commit -m "feat: implement parameters display with MEP category

- Add 'mep' category for Mean Effective Pressure parameters
- Move FMEP, IMEP, BMEP, PMEP to 'mep' category
- Group 29 parameters by 4 categories (global, mep, per-cylinder, vibe-model)
- Create ParameterRow component
- Display displayName, name, brief, unit for each parameter
- Add Info icon for each parameter

Verified: All 29 parameters display correctly
Related to roadmap: docs/tasks/performance-efficiency-header-roadmap.md"
```

- [X] Git commit выполнен (f897d1c)
- [X] Commit message информативный
- [X] Все параметры отображаются корректно

---

## Phase 4: Help Page - Tooltips 💬

**Цель:** Добавить tooltips с полным описанием параметров

**Задачи:**

### 4.1 Integrate Radix UI Tooltip component

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Import Tooltip components from `@/components/ui/tooltip`
- [ ] Wrap entire content с `<TooltipProvider>`
- [ ] Wrap Info icon с Tooltip компонентом

**Imports:**
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
```

---

### 4.2 Add description tooltips on Info icon hover

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Wrap Info icon с `<Tooltip>`
- [ ] `<TooltipTrigger>` на Info icon
- [ ] `<TooltipContent>` с `param.description`
- [ ] Fallback на `param.brief` если description отсутствует

**Код:**
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
  </TooltipTrigger>
  <TooltipContent className="max-w-md">
    <p>{param.description || param.brief}</p>
  </TooltipContent>
</Tooltip>
```

---

### 4.3 Style tooltips for readability

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Max width: 400px (для длинных описаний)
- [ ] Font size: 14px (readable)
- [ ] Padding: comfortable (16px)
- [ ] Background: contrast с page
- [ ] Z-index: above other content
- [ ] Animation: smooth fade-in

**CSS:**
```tsx
<TooltipContent
  className="max-w-md p-4 text-sm"
  side="left"
  align="start"
>
  <p>{param.description || param.brief}</p>
</TooltipContent>
```

---

### 4.4 Test: Verify tooltips work for all parameters

**Manual Testing Checklist:**

- [ ] **Проверить:** Навести на Info icon RPM → tooltip появляется
- [ ] **Проверить:** Tooltip содержит полное описание
- [ ] **Проверить:** Tooltip исчезает при уходе мыши
- [ ] **Проверить:** Проверить все 29 параметров (sample check)
- [ ] **Проверить:** Длинные descriptions обёрнуты корректно (max-width работает)
- [ ] **Проверить:** Tooltip не выходит за границы экрана
- [ ] **Проверить:** Mobile: тап на Info icon → tooltip открывается
- [ ] **Проверить:** Нет console errors
- [ ] **Проверить:** Проверить параметры без description (fallback на brief работает)

**Параметры для проверки fallback:**
- Convergence (только description, нет brief)

---

### 4.5 Git commit

**Команды:**
```bash
git add frontend/src/pages/HelpPage.tsx
git commit -m "feat: add tooltips with full descriptions

- Integrate Radix UI Tooltip component
- Show full parameter description on Info icon hover
- Style tooltips for readability (max-width 400px, padding 16px)
- Fallback to brief if description missing
- Add smooth animation

Tested: All 29 parameters tooltips working correctly
Related to roadmap: docs/tasks/performance-efficiency-header-roadmap.md"
```

- [ ] Git commit выполнен
- [ ] Commit message информативный
- [ ] Tooltips работают для всех параметров

---

## Phase 5: Help Page - Search 🔍

**Цель:** Добавить поиск для быстрого нахождения параметров

**Задачи:**

### 5.1 Add search input field

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Import `Input` component from `@/components/ui/input`
- [ ] Import `Search` icon from `lucide-react`
- [ ] Добавить search input под title section
- [ ] Placeholder: "Search parameters..."

**Код:**
```tsx
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// State
const [searchQuery, setSearchQuery] = useState('');

// JSX
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    type="text"
    placeholder="Search parameters..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-10"
  />
</div>
```

---

### 5.2 Implement search filtering logic

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Создать state: `const [searchQuery, setSearchQuery] = useState('')`
- [ ] Создать функцию `filterParameters(params, query)`
- [ ] Case-insensitive search
- [ ] Debounce опционально (для производительности)

**Код:**
```tsx
function filterParameters(params: ParameterMetadata[], query: string) {
  if (!query.trim()) return params;

  const lowerQuery = query.toLowerCase();

  return params.filter(param =>
    param.name.toLowerCase().includes(lowerQuery) ||
    param.displayName.toLowerCase().includes(lowerQuery) ||
    param.brief?.toLowerCase().includes(lowerQuery) ||
    param.description?.toLowerCase().includes(lowerQuery)
  );
}
```

---

### 5.3 Search by name, displayName, brief

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Match против `param.name` (RPM, P-Av, PCylMax)
- [ ] Match против `param.displayName` (Engine Speed, Average Power)
- [ ] Match против `param.brief` (краткое описание)
- [ ] Optional: match против `param.description` (полное описание)

**Применение:**
```tsx
const { global, perCylinder, vibeModel } = groupParametersByCategory();

const filteredGlobal = filterParameters(global, searchQuery);
const filteredPerCylinder = filterParameters(perCylinder, searchQuery);
const filteredVibeModel = filterParameters(vibeModel, searchQuery);
```

---

### 5.4 Test: Search functionality

**Manual Testing Checklist:**

- [ ] **Тест 1:** Ввести "pressure"
  - Ожидается: PCylMax, PMEP, BMEP, IMEP, FMEP (5 параметров)
- [ ] **Тест 2:** Ввести "temperature"
  - Ожидается: TCylMax, TUbMax, TexAv, TC-Av (4 параметра)
- [ ] **Тест 3:** Ввести "rpm"
  - Ожидается: RPM (1 параметр)
- [ ] **Тест 4:** Ввести "power"
  - Ожидается: P-Av, Power (2 параметра)
- [ ] **Тест 5:** Ввести "efficiency"
  - Ожидается: Seff, Teff, Ceff (3 параметра)
- [ ] **Тест 6:** Ввести "vibe"
  - Ожидается: VibeDelay, VibeDurat, VibeA, VibeM (4 параметра)
- [ ] **Тест 7:** Ввести несуществующий параметр "xyz"
  - Ожидается: "No parameters found" сообщение
- [ ] **Тест 8:** Очистить поиск
  - Ожидается: все 29 параметров вернулись
- [ ] **Проверить:** Real-time filtering (при вводе каждой буквы)
- [ ] **Проверить:** Case-insensitive ("RPM", "rpm", "Rpm" - все работают)

---

### 5.5 Git commit

**Команды:**
```bash
git add frontend/src/pages/HelpPage.tsx
git commit -m "feat: add search functionality to HelpPage

- Add search input field with Search icon
- Implement real-time filtering
- Search by name, displayName, brief, and description
- Case-insensitive search
- Show 'No parameters found' message when no results

Tested: Search works for all common queries (pressure, temperature, rpm, etc.)
Related to roadmap: docs/tasks/performance-efficiency-header-roadmap.md"
```

- [ ] Git commit выполнен
- [ ] Commit message информативный
- [ ] Все тесты поиска прошли успешно

---

## Phase 6: Help Page - Dynamic Units Display 🔄

**Цель:** Отображать единицы измерения в соответствии с выбранной системой единиц

**Задачи:**

### 6.1 Connect to Zustand store for current units

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Import `useAppStore` from `@/stores/appStore`
- [ ] Get `units` from store: `const units = useAppStore((state) => state.units)`
- [ ] Verify units reactivity (auto-update при изменении)

**Код:**
```tsx
import { useAppStore } from '@/stores/appStore';

export default function HelpPage() {
  const units = useAppStore((state) => state.units);

  // ... rest of component
}
```

---

### 6.2 Display units based on selected system

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Import `getParameterUnit` from `@/lib/unitsConversion`
- [ ] Использовать `getParameterUnit(param.name, units)` вместо `param.unit`
- [ ] Verify conversions:
  - SI: kW, N·m, bar, °C
  - American: bhp, lb-ft, psi, °F
  - HP: PS, N·m, bar, °C

**Код:**
```tsx
import { getParameterUnit } from '@/lib/unitsConversion';

function ParameterRow({ param }: ParameterRowProps) {
  const units = useAppStore((state) => state.units);
  const displayUnit = getParameterUnit(param.name, units);

  return (
    <div>
      {/* ... */}
      <span className="text-sm text-muted-foreground">{displayUnit}</span>
    </div>
  );
}
```

---

### 6.3 Update HelpPage to use dynamic units

**Файл:** `frontend/src/pages/HelpPage.tsx`

- [ ] Replace all static `param.unit` with `getParameterUnit(param.name, units)`
- [ ] Ensure units update when user changes system (reactivity check)
- [ ] Verify no hardcoded units remain

---

### 6.4 Test: Units switching

**Manual Testing Checklist:**

- [ ] **Тест 1:** SI system (default)
  - P-Av: kW
  - Torque: N·m
  - PCylMax: bar
  - TCylMax: °C
  - RPM: об/мин (unchanged)

- [ ] **Тест 2:** Переключить на American units
  - Открыть Settings → Units → American
  - **Проверить:** P-Av: bhp
  - **Проверить:** Torque: lb-ft
  - **Проверить:** PCylMax: psi
  - **Проверить:** TCylMax: °F
  - **Проверить:** RPM: об/мин (unchanged)

- [ ] **Тест 3:** Переключить на HP units
  - Открыть Settings → Units → HP
  - **Проверить:** P-Av: PS
  - **Проверить:** Torque: N·m (unchanged from SI)
  - **Проверить:** PCylMax: bar (unchanged from SI)
  - **Проверить:** TCylMax: °C (unchanged from SI)

- [ ] **Тест 4:** Переключить обратно на SI
  - **Проверить:** Все единицы вернулись к исходным

- [ ] **Тест 5:** Hot reload test
  - Изменить units на American
  - Перейти на ProjectPage
  - Вернуться на HelpPage
  - **Проверить:** Units сохранились (American)

---

### 6.5 Git commit

**Команды:**
```bash
git add frontend/src/pages/HelpPage.tsx
git commit -m "feat: dynamic units display in HelpPage

- Connect to Zustand store for current units
- Use getParameterUnit() for dynamic units conversion
- Support SI, American, and HP unit systems
- Auto-update when user changes units in Settings
- Maintain reactivity across page navigation

Tested: All 3 unit systems (SI, American, HP) working correctly
Related to roadmap: docs/tasks/performance-efficiency-header-roadmap.md"
```

- [ ] Git commit выполнен
- [ ] Commit message информативный
- [ ] Все 3 системы единиц работают корректно

---

## Phase 7: Final Testing & Polish 🧪

**Цель:** Комплексное тестирование всех функций и edge cases

**Задачи:**

### 7.1 Test full user flow

**Manual Testing Checklist:**

- [ ] **Flow 1:** HomePage → ProjectPage → Help
  - Старт на HomePage
  - Выбрать проект (Vesta 1.6 IM)
  - Нажать Help button
  - **Проверить:** Переход на /help успешен
  - **Проверить:** URL = `/help`

- [ ] **Flow 2:** Help → Back → ProjectPage
  - На HelpPage
  - Нажать Back button
  - **Проверить:** Возврат на ProjectPage
  - **Проверить:** Selected calculation сохранился
  - **Проверить:** Selected preset сохранился
  - **Проверить:** Units setting сохранился

- [ ] **Flow 3:** Direct navigation
  - Ввести в браузере `/help` напрямую
  - **Проверить:** Страница загружается
  - **Проверить:** Back button работает

- [ ] **Flow 4:** Multiple projects
  - Открыть Project 1 → Help
  - Back → HomePage
  - Открыть Project 2 → Help
  - **Проверить:** State не смешивается между проектами

---

### 7.2 Test all 29 parameters tooltips

**Systematic Testing:**

- [ ] **Global Parameters (8):**
  - [ ] RPM tooltip
  - [ ] P-Av tooltip
  - [ ] Torque tooltip
  - [ ] Convergence tooltip
  - [ ] TexAv tooltip
  - [ ] FMEP tooltip
  - [ ] Timing tooltip
  - [ ] TAF tooltip

- [ ] **Per-Cylinder Parameters (17):**
  - [ ] PCylMax tooltip
  - [ ] Deto tooltip
  - [ ] TCylMax tooltip
  - [ ] TUbMax tooltip
  - [ ] PurCyl tooltip
  - [ ] Power tooltip
  - [ ] IMEP tooltip
  - [ ] BMEP tooltip
  - [ ] PMEP tooltip
  - [ ] DRatio tooltip
  - [ ] Seff tooltip
  - [ ] Teff tooltip
  - [ ] Ceff tooltip
  - [ ] BSFC tooltip
  - [ ] TC-Av tooltip
  - [ ] MaxDeg tooltip
  - [ ] Delay tooltip
  - [ ] Durat tooltip

- [ ] **Vibe Combustion Model (4):**
  - [ ] VibeDelay tooltip
  - [ ] VibeDurat tooltip
  - [ ] VibeA tooltip
  - [ ] VibeM tooltip

**Критерии:**
- Tooltip появляется в течение 200ms
- Description корректный и читабельный
- Tooltip не выходит за границы экрана
- На mobile: tap работает

---

### 7.3 Test search with various queries

**Search Test Cases:**

- [ ] **Test 1:** Single letter
  - Query: "p"
  - Expected: P-Av, PCylMax, PMEP, IMEP, BMEP, Power, PurCyl, ...

- [ ] **Test 2:** Specific parameter
  - Query: "RPM"
  - Expected: Only RPM

- [ ] **Test 3:** Common words
  - Query: "cylinder"
  - Expected: All per-cylinder parameters

- [ ] **Test 4:** By metric type
  - Query: "temperature"
  - Expected: TCylMax, TUbMax, TexAv, TC-Av

- [ ] **Test 5:** Partial match
  - Query: "eff"
  - Expected: Seff, Teff, Ceff

- [ ] **Test 6:** Multi-word
  - Query: "brake pressure"
  - Expected: BMEP, BSFC

- [ ] **Test 7:** Case variations
  - Query: "rpm", "RPM", "Rpm"
  - Expected: All return RPM

- [ ] **Test 8:** Special characters
  - Query: "P-Av"
  - Expected: P-Av parameter

- [ ] **Test 9:** Empty query
  - Clear search
  - Expected: All 29 parameters visible

- [ ] **Test 10:** No results
  - Query: "xyz123"
  - Expected: "No parameters found" message

---

### 7.4 Test units switching (SI/American/HP)

**Units Switching Test:**

- [ ] **Test 1:** Default state (SI)
  - Open HelpPage
  - **Verify:** All units in SI (kW, N·m, bar, °C)

- [ ] **Test 2:** Switch to American
  - Open Settings → Units → American
  - **Verify:** Units change immediately
  - Check sample parameters:
    - P-Av: kW → bhp
    - Torque: N·m → lb-ft
    - PCylMax: bar → psi
    - TCylMax: °C → °F

- [ ] **Test 3:** Switch to HP
  - Settings → Units → HP
  - **Verify:**
    - P-Av: bhp → PS
    - Torque: lb-ft → N·m
    - PCylMax: psi → bar
    - TCylMax: °F → °C

- [ ] **Test 4:** Persistence across navigation
  - Set units to American
  - Navigate to ProjectPage
  - Return to HelpPage
  - **Verify:** Units still American

- [ ] **Test 5:** Tooltip units
  - Set units to American
  - Hover over tooltip
  - **Verify:** Description mentions correct units (if applicable)

---

### 7.5 Responsive design check

**Device Testing:**

- [ ] **Desktop (1920x1080)**
  - Layout: 2 columns optimal
  - Search bar: full width
  - Tooltips: position correctly
  - No horizontal scroll

- [ ] **Laptop (1366x768)**
  - Layout: 1-2 columns
  - All content visible
  - Tooltips fit screen

- [ ] **Tablet (768x1024)**
  - Layout: 1 column
  - Search bar: responsive width
  - Tooltips: adjust position
  - Touch: tap on Info icon works

- [ ] **Mobile (375x667)**
  - Layout: single column
  - Search bar: full width
  - Back button: visible and accessible
  - Tooltips: mobile-friendly positioning
  - No text overflow
  - Scrolling smooth

---

### 7.6 Test edge cases

**Edge Cases:**

- [ ] **Case 1:** Parameter без description
  - Check: Convergence (только description, нет brief)
  - **Verify:** Tooltip shows description

- [ ] **Case 2:** Parameter с пустым unit
  - Check: Convergence (unit = '')
  - **Verify:** No crash, empty string displayed

- [ ] **Case 3:** Very long description
  - Check: DRatio, BMEP, etc.
  - **Verify:** Tooltip wraps text (max-width 400px)
  - **Verify:** No text cutoff

- [ ] **Case 4:** Search with special chars
  - Query: "P-Av", "TC-Av"
  - **Verify:** Hyphen handled correctly

- [ ] **Case 5:** Rapid units switching
  - Quickly switch: SI → American → HP → SI
  - **Verify:** No errors, units update correctly

- [ ] **Case 6:** Search + Units change
  - Search "pressure"
  - Change units to American
  - **Verify:** Search results remain, units update

- [ ] **Case 7:** Direct URL access
  - Open `/help` in new tab (not logged in state)
  - **Verify:** Page loads
  - **Verify:** Default units (SI)

- [ ] **Case 8:** Browser back/forward
  - HomePage → ProjectPage → Help
  - Browser back button
  - **Verify:** State preserved
  - Browser forward
  - **Verify:** Returns to HelpPage

---

### 7.7 Git commit

**Команды:**
```bash
git add .
git commit -m "test: comprehensive testing of HelpPage

Phase 7: Final Testing & Polish

Completed tests:
- Full user flow (HomePage → ProjectPage → Help → Back)
- All 29 parameters tooltips verified
- Search functionality (10 test cases)
- Units switching (SI/American/HP, 5 test cases)
- Responsive design (desktop, laptop, tablet, mobile)
- Edge cases (8 scenarios)

All tests passed successfully.

Related to roadmap: docs/tasks/performance-efficiency-header-roadmap.md"
```

- [ ] Git commit выполнен
- [ ] Commit message содержит summary всех тестов
- [ ] Все тесты прошли успешно

---

## ✅ Definition of Done

Каждая задача считается **ЗАВЕРШЁННОЙ** только если:

1. ✅ **Код написан** и работает без ошибок
2. ✅ **Manual tests пройдены** (все чекбоксы в секции Testing отмечены)
3. ✅ **Responsive design проверен** (mobile/tablet/desktop)
4. ✅ **Git commit выполнен** с информативным сообщением
5. ✅ **Нет console errors** или warnings
6. ✅ **UX протестирован** (плавность, интуитивность)
7. ✅ **Edge cases проверены** (граничные условия)

**ЗАПРЕЩЕНО:**
- ❌ Говорить "задача выполнена" без тестирования
- ❌ Делать commit без проверки функционала
- ❌ Пропускать manual tests
- ❌ Игнорировать responsive design
- ❌ Оставлять console errors/warnings

---

## 📊 Progress Tracker

**Обновляется после каждой фазы:**

### Phase 1: Header Refactoring
- [ ] 1.1 Refactor Header.tsx
- [ ] 1.2 Add Help button
- [ ] 1.3 Update ProjectPage.tsx
- [ ] 1.4 Testing
- [ ] 1.5 Git commit

**Status:** ⏳ Not started

---

### Phase 2: Help Page - Basic Structure
- [ ] 2.1 Create HelpPage.tsx
- [ ] 2.2 Add Back button and title
- [ ] 2.3 Create parameter list layout
- [ ] 2.4 Add /help route
- [ ] 2.5 Testing
- [ ] 2.6 Git commit

**Status:** ⏳ Not started

---

### Phase 3: Help Page - Parameters Display
- [ ] 3.1 Grouping by category
- [ ] 3.2 Display metadata
- [ ] 3.3 Add Info icon
- [ ] 3.4 Testing
- [ ] 3.5 Git commit

**Status:** ⏳ Not started

---

### Phase 4: Help Page - Tooltips
- [ ] 4.1 Integrate Tooltip component
- [ ] 4.2 Add description tooltips
- [ ] 4.3 Style tooltips
- [ ] 4.4 Testing
- [ ] 4.5 Git commit

**Status:** ⏳ Not started

---

### Phase 5: Help Page - Search
- [ ] 5.1 Add search input
- [ ] 5.2 Filtering logic
- [ ] 5.3 Search implementation
- [ ] 5.4 Testing
- [ ] 5.5 Git commit

**Status:** ⏳ Not started

---

### Phase 6: Help Page - Dynamic Units
- [ ] 6.1 Connect to Zustand store
- [ ] 6.2 Display units based on system
- [ ] 6.3 Update HelpPage
- [ ] 6.4 Testing
- [ ] 6.5 Git commit

**Status:** ⏳ Not started

---

### Phase 7: Final Testing & Polish
- [ ] 7.1 Full user flow
- [ ] 7.2 All tooltips
- [ ] 7.3 Search tests
- [ ] 7.4 Units switching
- [ ] 7.5 Responsive design
- [ ] 7.6 Edge cases
- [ ] 7.7 Git commit

**Status:** ⏳ Not started

---

## 🎯 Success Criteria

Проект считается **ЗАВЕРШЁННЫМ** когда:

1. ✅ Header упрощён (Performance & Efficiency)
2. ✅ Help button добавлен и работает
3. ✅ HelpPage создана и роутинг работает
4. ✅ Все 29 параметров отображаются с метаданными
5. ✅ Tooltips работают для всех параметров
6. ✅ Поиск работает корректно (10+ test cases)
7. ✅ Dynamic units работают (SI/American/HP)
8. ✅ Responsive design (mobile/tablet/desktop)
9. ✅ Все edge cases покрыты
10. ✅ Нет console errors или warnings
11. ✅ Все git commits информативные
12. ✅ Documentation updated (roadmap, CHANGELOG)

---

## 📅 Timeline Estimate

**Общая оценка:** 6-8 часов работы

- Phase 1: 1 час
- Phase 2: 1 час
- Phase 3: 1 час
- Phase 4: 1 час
- Phase 5: 1 час
- Phase 6: 0.5 часа
- Phase 7: 1.5 часа

**Note:** Это оценка для опытного разработчика. Adjust based on familiarity with tech stack.

---

## 📝 Notes

- Все параметры берутся из `PARAMETERS` config (Single Source of Truth)
- Brief descriptions уже заполнены для всех параметров
- Full descriptions заполнены для большинства параметров
- Temperature units: °C (уже в .det/.pou файлах, не Kelvin!)
- Units conversion через `unitsConversion.ts`

---

**Created:** 2 ноября 2025
**Last Updated:** 2 ноября 2025
**Version:** 1.0
**Status:** 📋 Ready to Start

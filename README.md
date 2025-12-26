# Engine Results Viewer

Веб-приложение для визуализации и анализа результатов инженерных расчётов двигателей внутреннего сгорания.

## Быстрый старт

### Требования
- Node.js 18+
- npm или yarn

### Установка и запуск

```bash
# Запуск проекта (Backend + Frontend)
./scripts/start.sh

# Проверка статуса
./scripts/status.sh

# Остановка
./scripts/stop.sh
```

**Ручной запуск:**
```bash
# Backend (терминал 1)
cd backend && npm install && npm start

# Frontend (терминал 2)
cd frontend && npm install && npm run dev
```

**URLs:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### Конфигурация
Настройка в файле [config.yaml](config.yaml) (путь к данным, порт сервера, цвета графиков).

---

## Функциональность

✅ **Текущая версия (v2.0.0):**
- 🌍 **English UI** - international application
- 🔄 **Cross-project comparison** - compare calculations from different projects (1 primary + 4 comparisons)
- 📊 **Peak values always visible** - power, torque, RPM at peak displayed on cards (no hover needed)
- 🎯 **RPM step display** - shows actual data density instead of point count
- ⚙️ **Units conversion** - switch between SI/American/HP units (live conversion)
- 🎨 **Professional UI** - iPhone-quality design with smooth animations
- ♿ **Accessibility** - keyboard navigation, screen reader support, WCAG 2.1 AA compliant
- 📱 **Responsive design** - optimized for mobile, tablet, and desktop
- 🎭 **Empty states** - friendly messages and clear instructions
- ⚠️ **Error handling** - comprehensive error boundaries and user feedback
- 📈 **4 chart presets** - Power/Torque, Pressure/Temperature, Efficiency, Custom
- 📤 **Export** - PNG/SVG charts, CSV/Excel data tables
- 🏷️ **Project metadata** - descriptions, tags, client info, custom colors

**What's New in v2.0:**
- Complete redesign with modern, professional interface
- Cross-project calculation comparison (mix calculations from any projects)
- **Multi-format support**: .det (24 params) and .pou (71-78 params) files
- Always-visible peak values cards with hover effects
- Settings popover with units conversion and theme switching
- New modal dialogs for calculation selection (Primary + Comparison)
- Restructured left panel with three sections
- Enhanced responsive design for all screen sizes
- Full accessibility implementation

**Details:** See [CHANGELOG.md](CHANGELOG.md)

---

## Технологии

**Backend:** Node.js, Express, js-yaml, p-queue, async-mutex
**Frontend:** React 18, TypeScript, Vite, ECharts, TailwindCSS, Tanstack Table
**Подробнее:** См. [docs/architecture.md](docs/architecture.md)

---

## Документация

### Главная документация
- **[docs/architecture.md](docs/architecture.md)** - 📖 Полная архитектура проекта (Backend, Frontend, Parsers, API, Charts)
- **[CLAUDE.md](CLAUDE.md)** - 🤖 Инструкции для работы с Claude Code
- **[CHANGELOG.md](CHANGELOG.md)** - 📝 История изменений
- **[DOCUMENTATION_GUIDE.md](DOCUMENTATION_GUIDE.md)** - 📋 Правила документации (SSOT)

### Установка и настройка
- **[docs/setup.md](docs/setup.md)** - Детальная установка и настройка
- **[scripts/README.md](scripts/README.md)** - Скрипты управления проектом (start.sh, stop.sh, status.sh)
- **[docs/troubleshooting.md](docs/troubleshooting.md)** - Решение проблем
- **[docs/decisions/016-railway-deployment.md](docs/decisions/016-railway-deployment.md)** - Railway deployment (production)

### Референсная документация
- **[docs/engmod4t-suite/README.md](docs/engmod4t-suite/README.md)** - 📚 EngMod4T Suite (DAT4T, EngMod4T, Post4T) - AI-friendly docs
- **[docs/file-formats/README.md](docs/file-formats/README.md)** - Форматы файлов (.det, .pou, .prt)
- **[docs/PARAMETERS-REFERENCE.md](docs/PARAMETERS-REFERENCE.md)** - Справочник всех 73 параметров двигателя
- **[docs/decisions/](docs/decisions/)** - Architecture Decision Records (ADRs)

### Техническое задание
- **[engine-viewer-tech-spec .md](engine-viewer-tech-spec%20.md)** - Полное ТЗ (устарело, см. architecture.md)

---

## Статус проекта

**Current Version:** v2.0.0 ✅

**v2.0.0 Features:**
- ✅ Cross-project calculation comparison (1 primary + 4 comparisons)
- ✅ Multi-format support (.det, .pou, .pou-merged)
- ✅ Units conversion (SI/American/HP) with live updates
- ✅ 6 chart presets (Power/Torque, Pressure/Temp, MEP, Critical, Efficiency, Custom)
- ✅ Peak values cards (always visible, no hover needed)
- ✅ Professional UI (iPhone-quality design, smooth animations)
- ✅ Accessibility (WCAG 2.1 AA compliant, keyboard navigation, screen readers)
- ✅ Responsive design (mobile, tablet, desktop optimized)
- ✅ Settings management (theme, units, animation, grid)
- ✅ DataTable with multi-project support
- ✅ Export capabilities (PNG/SVG charts, CSV/Excel data)

**Previous versions:** See [CHANGELOG.md](CHANGELOG.md)

---

## Лицензия

MIT

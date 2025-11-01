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
- Always-visible peak values cards with hover effects
- Settings popover with units conversion and theme switching
- New modal dialogs for calculation selection (Primary + Comparison)
- Restructured left panel with three sections
- Enhanced responsive design for all screen sizes
- Full accessibility implementation

**Details:** See [CHANGELOG.md](CHANGELOG.md)

---

## Технологии

**Backend:** Node.js, Express, js-yaml
**Frontend:** React 18, TypeScript, Vite, ECharts, TailwindCSS, Tanstack Table
**Подробнее:** См. [docs/architecture.md](docs/architecture.md)

---

## Документация

### Основная документация
- **[docs/setup.md](docs/setup.md)** - детальная установка и настройка
- **[scripts/README.md](scripts/README.md)** - скрипты управления проектом
- **[docs/architecture.md](docs/architecture.md)** - архитектура проекта
- **[docs/api.md](docs/api.md)** - API документация
- **[docs/troubleshooting.md](docs/troubleshooting.md)** - решение проблем

### Для разработчиков
- **[CLAUDE.md](CLAUDE.md)** - инструкции для работы с Claude Code
- **[roadmap.md](roadmap.md)** - план разработки и текущий статус
- **[CHANGELOG.md](CHANGELOG.md)** - история изменений

### Техническое задание
- **[engine-viewer-tech-spec .md](engine-viewer-tech-spec%20.md)** - полное ТЗ
- **[DOCUMENTATION_GUIDE.md](DOCUMENTATION_GUIDE.md)** - правила документации

---

## Статус проекта

**Stable Version:** v1.0.0 ✅
**Development Version:** v2.0.0 (65% complete) 🚧

**v1.0.0 (Stable):**
- ✅ Backend (парсинг, REST API, метаданные)
- ✅ Frontend (UI, графики, таблицы, экспорт)
- ✅ Все 4 пресета графиков
- ✅ Таблица данных с экспортом

**v2.0.0 (In Development):**
- ✅ Cross-project calculation comparison
- ✅ Multi-calculation visualization (1 primary + 4 comparisons)
- ✅ Units conversion (SI/American/HP)
- ✅ Peak values cards (always visible)
- ✅ Settings popover (theme, animation, grid)
- ✅ DataTable with multi-project support
- 🚧 UI translations, polish, testing

**Development Plan:** См. [roadmap-v2.md](roadmap-v2.md)

---

## Лицензия

MIT

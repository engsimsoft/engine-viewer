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

✅ **Текущая версия (v1.0.0):**
- Парсинг .det файлов (результаты расчётов ДВС)
- REST API для работы с данными
- Интерактивные графики (ECharts): 4 пресета
- Таблица данных с сортировкой и пагинацией
- Экспорт графиков (PNG, SVG)
- Экспорт данных (CSV, Excel)
- Управление метаданными проектов
- Выбор расчётов для сравнения (до 5)

**Детали:** См. [CHANGELOG.md](CHANGELOG.md)

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

**Версия:** v1.0.0
**Статус:** Полнофункциональная версия ✅

**Завершённые этапы:**
- ✅ Backend (парсинг, REST API, метаданные)
- ✅ Frontend (UI, графики, таблицы, экспорт)
- ✅ Все 4 пресета графиков
- ✅ Таблица данных с экспортом

**Следующие этапы:** См. [roadmap.md](roadmap.md)

---

## Лицензия

MIT

# Детальная установка и настройка

**Дата:** 21 октября 2025
**Версия:** 1.0

---

## Prerequisites

Перед началом установи:
- **Node.js 18+** ([https://nodejs.org/](https://nodejs.org/))
- **npm 9+** (идёт в комплекте с Node.js)
- **Git** ([https://git-scm.com/](https://git-scm.com/))

Проверка версий:
```bash
node --version   # v18.x или выше
npm --version    # v9.x или выше
git --version    # любая версия
```

---

## Клонирование проекта

```bash
# Клонировать репозиторий (если используешь Git)
git clone <repository-url>
cd engine-viewer

# Или просто открой папку проекта
cd /path/to/engine-viewer
```

---

## Backend Setup

### 1. Переход в папку backend
```bash
cd backend
```

### 2. Установка зависимостей
```bash
npm install
```

**Устанавливаются пакеты:**
- `express` - HTTP сервер
- `cors` - CORS middleware для frontend
- `js-yaml` - парсинг config.yaml
- `chokidar` - file watching (опционально)

### 3. Структура backend
```
backend/
├── src/
│   ├── server.js         # ✅ Express сервер
│   ├── config.js         # ✅ Загрузка config.yaml
│   ├── fileScanner.js    # ⏳ Сканирование папки (в разработке)
│   ├── fileParser.js     # ⏳ Парсинг .det (в разработке)
│   └── routes/           # 📁 API routes (placeholder)
│       ├── projects.js   # ⏳ GET /api/projects
│       └── data.js       # ⏳ GET /api/project/:id
├── package.json          # ✅ npm конфигурация
├── .gitignore           # ✅ Правила игнорирования
└── node_modules/        # ✅ 88 пакетов
```

### 4. Запуск backend

**Режим разработки (с auto-reload):**
```bash
npm run dev
```

**Production режим:**
```bash
npm start
```

**Результат:**
```
📋 Loading configuration...
✅ Configuration loaded successfully
   Data folder: ./test-data
   Server: localhost:3000
✅ Configuration validation passed

🚀 Server started successfully!
   URL: http://localhost:3000
   Environment: development
   Health check: http://localhost:3000/health
   API info: http://localhost:3000/api
```

### 5. Проверка работы
Открой в браузере или используй curl:
```bash
# Health check
curl http://localhost:3000/health

# Список проектов (после реализации)
curl http://localhost:3000/api/projects
```

---

## Frontend Setup

### 1. Переход в папку frontend (из корня)
```bash
cd frontend
# Если был в backend:
cd ../frontend
```

### 2. Установка зависимостей
```bash
npm install
```

**Устанавливаются пакеты:**
- React 18
- TypeScript 5
- Vite 5
- ECharts 5 + echarts-for-react
- TailwindCSS 3
- Tanstack Table 8
- Axios, date-fns, lucide-react

Это может занять 1-2 минуты.

### 3. Структура frontend
```
frontend/
├── src/
│   ├── components/      # React компоненты
│   ├── pages/          # Страницы (HomePage, ProjectPage)
│   ├── hooks/          # Custom hooks
│   ├── types/          # TypeScript типы
│   ├── utils/          # Утилиты
│   ├── api/            # API клиент (axios)
│   ├── App.tsx         # Главный компонент
│   ├── main.tsx        # Точка входа
│   └── index.css       # Глобальные стили
├── public/             # Статичные файлы
├── index.html          # HTML шаблон
├── package.json
├── tsconfig.json       # TypeScript конфигурация
├── vite.config.ts      # Vite конфигурация
└── tailwind.config.js  # TailwindCSS конфигурация
```

### 4. Запуск frontend
```bash
npm run dev
```

**Результат:**
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. Проверка работы
Открой в браузере:
```
http://localhost:5173
```

Должна открыться главная страница приложения.

---

## Настройка config.yaml

В корне проекта находится файл [config.yaml](../config.yaml).

**Пример конфигурации:**
```yaml
# Путь к папке с файлами
files:
  path: "./test-data"
  extensions: [".det"]
  scan_on_startup: true
  watch_interval: 5

# Сервер
server:
  host: "localhost"
  port: 3000
  auto_open_browser: false

# UI
ui:
  max_calculations_compare: 5
  default_preset: "power_torque"
  language: "ru"

# Цвета расчётов
colors:
  calculation_1: "#ff6b6b"
  calculation_2: "#4ecdc4"
  calculation_3: "#45b7d1"
  calculation_4: "#f9ca24"
  calculation_5: "#a29bfe"

# Графики
charts:
  theme: "light"
  animation: true
  show_grid: true
  export_format: "png"
```

**Настройка:**
- `files.path` - путь к папке с `.det` файлами (по умолчанию `./test-data`)
- `server.port` - порт backend сервера (по умолчанию 3000)
- `ui.max_calculations_compare` - максимум расчётов для сравнения (5)
- `colors` - цвета линий на графиках

**⚠️ Важно:** При изменении `server.port` нужно также изменить proxy в `frontend/vite.config.ts`.

---

## Настройка Vite Proxy

Frontend использует Vite proxy для обращения к backend API.

**Файл:** `frontend/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

**Как работает:**
- Frontend запущен на `http://localhost:5173`
- Backend запущен на `http://localhost:3000`
- Запрос `http://localhost:5173/api/projects` → proxy → `http://localhost:3000/api/projects`

**⚠️ Если изменил порт backend:** обнови `target` в vite.config.ts.

---

## Проверка полной установки

### 1. Два терминала

**Терминал 1 (Backend):**
```bash
cd backend
npm run dev
```

**Терминал 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### 2. Проверка в браузере

Открой `http://localhost:5173`

**Должно работать:**
- ✅ Frontend загружается
- ✅ Нет ошибок в консоли браузера (F12 → Console)
- ✅ Backend отвечает на `/api/*` запросы

### 3. Проверка backend отдельно

```bash
curl http://localhost:3000/health

# Должен вернуть:
# {"status":"ok"}
```

---

## Troubleshooting

### Проблема: "EADDRINUSE: address already in use"

**Причина:** Порт 3000 или 5173 уже занят.

**Решение:**
```bash
# Найти процесс на порту 3000
lsof -i :3000

# Убить процесс (замени PID на реальный)
kill -9 <PID>

# Или измени порт в config.yaml (backend) или vite.config.ts (frontend)
```

---

### Проблема: "Module not found" или "Cannot find module"

**Причина:** Зависимости не установлены.

**Решение:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### Проблема: "CORS policy blocked"

**Причина:** CORS не настроен в backend.

**Решение:** Проверь `backend/src/server.js`:
```javascript
const cors = require('cors');
app.use(cors());
```

---

### Проблема: "Cannot GET /api/projects"

**Причина:** Backend не запущен или routes не подключены.

**Решение:**
1. Проверь что backend запущен (`npm run dev` в папке backend)
2. Проверь `http://localhost:3000/health` - должен работать
3. Проверь что routes подключены в `server.js`

---

### Проблема: Frontend показывает "Failed to fetch"

**Причина:** Backend не запущен или proxy не настроен.

**Решение:**
1. Проверь что backend запущен (`http://localhost:3000/health`)
2. Проверь vite.config.ts → proxy настроен правильно
3. Перезапусти frontend (`npm run dev`)

---

## Production Build

### Backend Production
```bash
cd backend
npm run start
# Или используй PM2, Docker и т.д.
```

### Frontend Production
```bash
cd frontend
npm run build
# Результат в папке dist/

npm run preview
# Превью production сборки
```

**Деплой:** См. [docs/deployment.md](deployment.md) (будет создан позже)

---

## Следующие шаги

После успешной установки:
1. Изучи [docs/architecture.md](architecture.md) - архитектура проекта
2. Изучи [docs/api.md](api.md) - API документация
3. Открой [roadmap.md](../roadmap.md) - план разработки
4. Начни выполнение задач по roadmap

---

## Полезные команды

```bash
# Backend
npm run dev          # Dev режим (nodemon)
npm run start        # Production
npm test             # Тесты

# Frontend
npm run dev          # Dev сервер
npm run build        # Production сборка
npm run preview      # Превью сборки
npm run lint         # ESLint проверка
npm run type-check   # TypeScript проверка
```

---

**Установка завершена! Можно начинать разработку 🚀**

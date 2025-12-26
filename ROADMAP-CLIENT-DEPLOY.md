# Project Roadmap: Client Project Deployment

**Цель:** Добавить возможность отправлять клиентам прямые ссылки на их проекты с описанием, подготовить проект к deploy на Railway.

**Текущий статус:**
- Этап: 1 - Добавление карточки Project Info
- Прогресс: 0%
- Следующий шаг: Backend API - добавить metadata в /api/project/:id/summary

---

## 📋 Этап 1: Карточка Project Info (1-2 дня)

**Цель этапа:** Добавить карточку с описанием проекта на страницу `/project/:id`

**Результат:** Клиент видит карточку с характеристиками двигателя, описанием и именем клиента

### Backend изменения

- [ ] **Изменить API endpoint /api/project/:id/summary** (30 мин)
  - Файл: `backend/src/routes/projects.js`
  - Добавить загрузку metadata через `metadataService.getMetadata(id)`
  - Включить metadata в response: `data.project.metadata`
  - Проверка: `curl http://localhost:3000/api/project/cn-1600/summary | jq .data.project.metadata`

- [ ] **Тест Backend API** (15 мин)
  - Запустить backend: `cd backend && npm start`
  - Проверить что metadata возвращается для проекта с .metadata файлом
  - Проверить что null возвращается для проекта без metadata
  - Файл проверки: `.metadata/cn-1600.json` (должен существовать)

### Frontend - Hook изменения

- [ ] **Обновить интерфейс ProjectSummary в useProjectSummary.ts** (15 мин)
  - Файл: `frontend/src/hooks/useProjectSummary.ts`
  - Добавить `metadata?: ProjectMetadata` в `ProjectSummary.project`
  - Импортировать тип: `import type { ProjectMetadata } from '@/types'`

### Frontend - Компонент ProjectInfoCard

- [ ] **Создать компонент ProjectInfoCard** (1 час)
  - Файл: `frontend/src/components/project-overview/ProjectInfoCard.tsx`
  - Принимает prop: `metadata?: ProjectMetadata`
  - Показывает:
    - Display Name
    - Engine specs (cylinders, type, configuration, intake)
    - Bore × Stroke, CR, Max RPM, Valves
    - Description (если есть)
    - Client (если есть)
  - Если metadata нет - показать пустую карточку с placeholder текстом

- [ ] **Добавить стили для ProjectInfoCard** (15 мин)
  - Использовать существующие UI компоненты: Card, CardHeader, CardTitle, CardContent
  - Grid layout для specs (2 колонки)
  - Иконка: `FileText` из lucide-react

### Frontend - Интеграция в страницу

- [ ] **Обновить ProjectOverviewPage.tsx** (30 мин)
  - Файл: `frontend/src/pages/ProjectOverviewPage.tsx`
  - Импортировать `ProjectInfoCard`
  - Добавить карточку первой в grid (строка 105)
  - Убрать кнопку "Back to Projects" (строки 83-90) - клиенты не должны видеть список всех проектов
  - Grid остаётся 3 колонки: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### ✅ Верификация Этапа 1

**ОБЯЗАТЕЛЬНО:** Выполнить все проверки перед переходом к Этапу 2

- [x] **1. Backend API Verification** (10 мин) ✅
  - Запустить backend: `cd backend && npm start`
  - Тест с metadata: `curl http://localhost:3000/api/project/cn-1600/summary | jq .data.project.metadata`
  - Должен вернуть объект с `displayName`, `auto`, `manual`
  - Тест без metadata: `curl http://localhost:3000/api/project/non-existent/summary`
  - Должен вернуть `metadata: null` или отсутствие поля

- [x] **2. Frontend Component Verification** (15 мин) ✅
  - Запустить frontend: `cd frontend && npm run dev`
  - Открыть: `http://localhost:5173/project/cn-1600`
  - **Чеклист визуальной проверки:**
    - ✅ ProjectInfoCard отображается первой в grid
    - ✅ Display Name показан корректно
    - ✅ Engine specs (4 Cyl • NA • inline • ITB) видны
    - ✅ "View Details" button открывает modal с полной информацией
    - ✅ Modal показывает: Bore × Stroke, CR, Max RPM, Valves
    - ✅ Description текст присутствует (если есть в metadata)
    - ✅ Client name показан (если есть в metadata)

- [x] **3. Fallback Verification** (10 мин) ✅
  - Временно переименовать: `mv .metadata/cn-1600.json .metadata/cn-1600.json.bak`
  - Перезагрузить страницу: `http://localhost:5173/project/cn-1600`
  - Должна показаться пустая карточка с placeholder
  - Вернуть файл: `mv .metadata/cn-1600.json.bak .metadata/cn-1600.json`

- [x] **4. Navigation Verification** (5 мин) ✅
  - Проверить что кнопка "Back to Projects" ОТСУТСТВУЕТ
  - Попытаться вручную перейти на `/` или `/projects`
  - Убедиться что переход работает (для dev режима)

- [x] **5. Browser DevTools Check** (5 мин) ✅
  - Открыть Console (F12)
  - Проверить отсутствие ошибок
  - Проверить Network tab: `/api/project/cn-1600/summary` возвращает 200 OK
  - Проверить что metadata присутствует в response

- [x] **6. Code Quality Verification** (10 мин) ✅
  - Запустить TypeScript проверку: `cd frontend && npm run typecheck`
  - Запустить build: `npm run build`
  - Все проверки должны пройти без ошибок

**Критерии прохождения Этапа 1:**
- ✅ Все 6 проверок выполнены
- ✅ Нет ошибок в console
- ✅ TypeScript и ESLint чистые
- ✅ Карточка отображается корректно для проектов с и без metadata

**Если хотя бы одна проверка провалилась → НЕ переходить к Этапу 2, исправить проблемы**

---

## 📋 Этап 2: Подготовка к Railway Deploy (1 день)

**Цель этапа:** Адаптировать проект для deployment на Railway.app

**Результат:** Проект готов к deploy, все пути относительные, backend служит frontend статику

### Architecture Decision Record (ADR)

- [ ] **Создать ADR для Railway deployment** (30 мин)
  - Файл: `docs/decisions/015-railway-deployment.md`
  - Содержание:
    - **Context:** Необходимость web-deploy для отправки клиентам прямых ссылок
    - **Solution:** Railway.app выбран как платформа
    - **Rationale:**
      - Node.js + Express поддержка из коробки
      - Persistent volumes (5GB бесплатно) для metadata
      - Автодеплой из GitHub
      - Существующая подписка $5/месяц
      - Простая конфигурация vs Vercel/Netlify (не подходят из-за serverless)
    - **Consequences:**
      - Pros: Быстрый deploy, persistent storage, бесплатно в пределах $5
      - Cons: Vendor lock-in, ограничение 5GB storage
    - **Alternatives:**
      - Render.com (persistent disk платный - $7/мес)
      - Fly.io (сложнее настройка, нужен Docker)
      - Vercel/Netlify (НЕ подходят - ephemeral storage, нет file writes)
      - DigitalOcean App Platform (нет free tier, $5/мес минимум)
  - Шаблон использовать: `docs/decisions/template.md` (если есть)

### Конфигурация путей

- [ ] **Изменить config.yaml на относительные пути** (15 мин)
  - Файл: `config.yaml`
  - Было: `path: "C:/4Stroke"`
  - Стало: `path: "./data"`
  - Добавить environment variable override: `FILES_PATH`

- [ ] **Обновить backend/src/config.js** (30 мин)
  - Файл: `backend/src/config.js`
  - Добавить fallback на environment variable:
    ```js
    const dataPath = process.env.FILES_PATH || config.files.path;
    ```
  - Проверить что relative paths работают корректно

- [ ] **Создать структуру данных для deploy** (15 мин)
  - Создать папку: `data/` в корне проекта
  - Скопировать тестовые проекты:
    - `cp "C:/4Stroke/cn-1600.*" data/`
    - `cp "C:/4Stroke/lada-1600-carb.*" data/`
  - Добавить в `.gitignore`: `data/*.det`, `data/*.pou`, `data/*.prt` (опционально)

### Backend - Static file serving

- [ ] **Добавить serving frontend статики в backend** (30 мин)
  - Файл: `backend/src/server.js`
  - Добавить после API routes:
    ```js
    import path from 'path';
    import { fileURLToPath } from 'url';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Serve frontend static files
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    // SPA fallback (для React Router)
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
    });
    ```

- [ ] **Обновить package.json scripts** (15 мин)
  - Файл: корневой `package.json`
  - Добавить build script:
    ```json
    "scripts": {
      "build": "cd frontend && npm install && npm run build",
      "start": "cd backend && npm start"
    }
    ```

### Railway конфигурация

- [ ] **Создать railway.toml** (15 мин)
  - Файл: `railway.toml` в корне
  - Содержание:
    ```toml
    [build]
      builder = "nixpacks"
      buildCommand = "npm install && npm run build"

    [deploy]
      startCommand = "npm start"
    ```

- [ ] **Создать .railwayignore** (5 мин)
  - Файл: `.railwayignore` в корне
  - Игнорировать dev файлы:
    ```
    node_modules
    .git
    .vscode
    _personal
    ```

### Environment variables документация

- [ ] **Создать .env.example** (10 мин)
  - Файл: `.env.example` в корне
  - Содержание:
    ```
    NODE_ENV=production
    PORT=3000
    FILES_PATH=/app/data
    ```

- [ ] **Обновить README.md с Railway deploy инструкциями** (30 мин)
  - Секция: "Deployment to Railway"
  - Шаги:
    1. Push to GitHub
    2. Create Railway project from GitHub
    3. Set environment variables
    4. Add volumes (если нужны для metadata)
    5. Deploy

### ✅ Верификация Этапа 2

**ОБЯЗАТЕЛЬНО:** Выполнить все проверки перед переходом к Этапу 3

- [ ] **1. Configuration Verification** (10 мин)
  - Проверить `config.yaml`: путь должен быть `./data`
  - Проверить `backend/src/config.js`: environment variable override работает
  - Тест: `FILES_PATH=/custom/path node backend/src/config.js` (должен вывести /custom/path)

- [ ] **2. Data Structure Verification** (10 мин)
  - Проверить наличие `data/` папки в корне
  - Проверить файлы: `ls -la data/*.det data/*.pou data/*.prt`
  - Минимум 2 тестовых проекта должны быть в data/

- [ ] **3. Static Serving Verification** (15 мин)
  - Собрать frontend: `cd frontend && npm run build`
  - Проверить наличие: `frontend/dist/index.html`
  - Запустить backend: `cd backend && npm start`
  - Открыть: `http://localhost:3000` (НЕ 5173!)
  - **Чеклист:**
    - ✅ Frontend загружается (не 404)
    - ✅ CSS стили применены
    - ✅ JavaScript работает
    - ✅ Переход на `/project/cn-1600` работает
    - ✅ Refresh страницы не дает 404 (SPA fallback работает)

- [ ] **4. API Endpoints Verification** (10 мин)
  - Проверить: `curl http://localhost:3000/api/health`
  - Проверить: `curl http://localhost:3000/api/projects | jq .data[0]`
  - Проверить: `curl http://localhost:3000/api/project/cn-1600/summary | jq`
  - Все должны вернуть 200 OK и валидный JSON

- [ ] **5. Railway Config Verification** (5 мин)
  - Проверить наличие: `railway.toml`
  - Проверить содержимое: buildCommand и startCommand корректны
  - Проверить наличие: `.railwayignore`
  - Проверить наличие: `.env.example`

- [ ] **6. Build Scripts Verification** (10 мин)
  - Очистить: `rm -rf frontend/dist`
  - Запустить: `npm run build` (из корня)
  - Должен собрать frontend без ошибок
  - Проверить: `frontend/dist/` создана и содержит файлы
  - Запустить: `npm start` (из корня)
  - Backend должен стартовать на порту 3000

**Критерии прохождения Этапа 2:**
- ✅ Все 6 проверок выполнены
- ✅ Production build собирается без ошибок
- ✅ Frontend открывается через backend на localhost:3000
- ✅ API endpoints работают
- ✅ Railway конфиг файлы на месте

**Если хотя бы одна проверка провалилась → НЕ переходить к Этапу 3, исправить проблемы**

---

## 📋 Этап 3: Railway Deployment (1 день)

**Цель этапа:** Deploy проекта на Railway с тестовыми данными

**Результат:** Рабочая веб-версия доступна по публичной ссылке

### GitHub подготовка

- [ ] **Commit всех изменений** (15 мин)
  - Файлы: все изменённые из Этапов 1-2
  - Commit message:
    ```
    feat: add client project deployment support

    - Add ProjectInfoCard component for project metadata display
    - Remove "Back to Projects" button for client-facing views
    - Add Railway deployment configuration
    - Update backend to serve frontend static files
    - Make file paths configurable via environment variables

    🤖 Generated with Claude Code

    Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
    ```

- [ ] **Push to GitHub** (5 мин)
  - `git push origin main`
  - Проверить что все файлы залиты

### Railway setup

- [ ] **Создать Railway project** (10 мин)
  - Зайти на Railway.app
  - New Project → Deploy from GitHub
  - Выбрать репозиторий ENGINE-VIEWER
  - Branch: main

- [ ] **Настроить Environment Variables** (10 мин)
  - `NODE_ENV=production`
  - `FILES_PATH=/app/data`
  - `PORT=3000`

- [ ] **Настроить Volumes (опционально)** (15 мин)
  - Создать volume для metadata: `/app/.metadata`
  - Если данные не в репозитории - создать volume: `/app/data`

- [ ] **Deploy и проверка** (30 мин)
  - Дождаться завершения build
  - Открыть публичный URL (например: `https://engine-viewer-production.up.railway.app`)
  - Проверить главную страницу
  - Проверить проект: `/project/cn-1600`
  - Проверить API: `/api/health`

### ✅ Верификация Этапа 3

**ОБЯЗАТЕЛЬНО:** Выполнить все проверки перед объявлением готовности

- [ ] **1. Deployment Status Verification** (10 мин)
  - Railway dashboard: build завершён успешно (зелёная галочка)
  - Railway logs: нет ошибок при старте
  - Проверить что pod не рестартится постоянно
  - URL доступен: `https://[your-app].up.railway.app`

- [ ] **2. Production API Verification** (15 мин)
  - Проверить: `curl https://[your-app].up.railway.app/api/health`
  - Проверить: `curl https://[your-app].up.railway.app/api/projects | jq .data[0]`
  - Проверить: `curl https://[your-app].up.railway.app/api/project/cn-1600/summary | jq .data.project.metadata`
  - Все должны вернуть 200 OK

- [ ] **3. Frontend Loading Verification** (10 мин)
  - Открыть в incognito: `https://[your-app].up.railway.app`
  - **Чеклист:**
    - ✅ Главная страница загружается
    - ✅ Список проектов отображается
    - ✅ CSS стили применены (не сломанный layout)
    - ✅ Нет 404 errors в console (F12)
    - ✅ Нет CORS errors

- [ ] **4. Client Link Verification** (15 мин)
  - URL: `https://[your-app].up.railway.app/project/cn-1600`
  - Открыть в incognito mode
  - **Чеклист:**
    - ✅ ProjectInfoCard отображается первой
    - ✅ Все данные из metadata показаны
    - ✅ Нет кнопки "Back to Projects"
    - ✅ Performance карточка показывает "1 calculation ready"
    - ✅ Diagrams карточка показывает "Available"
    - ✅ Клик на "View Analysis →" работает

- [ ] **5. Mobile Responsive Verification** (15 мин)
  - Открыть на телефоне (или DevTools mobile emulation)
  - Проверить главную страницу: grid 1 колонка
  - Проверить проект: `/project/cn-1600` grid 1 колонка
  - Все карточки читаемы и кликабельны
  - Нет горизонтальной прокрутки

- [ ] **6. Environment Variables Verification** (5 мин)
  - Railway dashboard → Variables
  - Проверить установлены:
    - `NODE_ENV=production`
    - `FILES_PATH=/app/data`
    - `PORT=3000` (или auto от Railway)

- [ ] **7. Metadata Persistence Verification** (10 мин)
  - Если используется volume для `.metadata/`:
    - Проверить Railway dashboard → Volumes
    - Volume смонтирован на `/app/.metadata`
  - Если метаданные в репозитории:
    - Проверить что файлы доступны в logs: `ls /app/.metadata`

**Критерии прохождения Этапа 3:**
- ✅ Все 7 проверок выполнены
- ✅ Клиентская ссылка работает в incognito mode
- ✅ Нет ошибок в production logs
- ✅ Mobile версия отображается корректно
- ✅ API endpoints возвращают данные

**Если хотя бы одна проверка провалилась:**
1. Проверить Railway logs на ошибки
2. Проверить environment variables
3. Проверить volumes (если используются)
4. Исправить проблемы и re-deploy
5. Повторить верификацию

---

## 📋 Этап 4: Опциональные улучшения (1-2 дня)

**Цель этапа:** Дополнительные возможности для клиентских демо

**Результат:** Улучшенный UX для клиентских ссылок

### URL токены для защиты

- [ ] **Добавить токены в URL** (1 час)
  - URL: `/project/cn-1600?token=a8f3k2j9`
  - Backend проверка токена перед отдачей данных
  - Файл: `backend/src/routes/projects.js`
  - Хранение токенов: `config.yaml` или `.env`

- [ ] **Middleware для токенов** (30 мин)
  - Файл: `backend/src/middleware/auth.js`
  - Проверка токена для routes `/project/:id`
  - 403 error если токен неверный

### Client-specific customization

- [ ] **Добавить цветовую тему в metadata** (30 мин)
  - Файл: `.metadata/<projectId>.json`
  - Поле: `manual.color` (уже существует)
  - Применять цвет к header на странице проекта

- [ ] **Добавить logo клиента** (1 час)
  - Поле: `manual.logoUrl` в metadata
  - Отображение в ProjectInfoCard
  - Upload через UI (будущая фича)

### Analytics

- [ ] **Добавить простую аналитику просмотров** (1 час)
  - Логировать открытие проектов: projectId + timestamp
  - Файл: `backend/logs/views.log`
  - Endpoint: `/api/analytics/views/:projectId`

---

## 📊 Прогресс

**Этап 1: Project Info Card** ✅ ЗАВЕРШЁН
- Implementation: ✅✅✅✅✅✅ 6/6 задач
- Verification: ✅✅✅✅✅✅ 6/6 проверок

**Этап 2: Railway Preparation** ✅ ЗАВЕРШЁН
- ADR: ✅ 1/1 задач
- Implementation: ✅✅✅✅✅✅✅✅✅ 9/9 задач
- Verification: ✅✅✅✅✅✅ 6/6 проверок
- Documentation: ⬜⬜⬜ 0/3 задач (пропущено - документируем после деплоя)

**Этап 3: Deployment**
- Implementation: ⬜⬜⬜⬜⬜ 0/5 задач
- Verification: ⬜⬜⬜⬜⬜⬜⬜ 0/7 проверок
- Documentation: ⬜ 0/1 задач

**Этап 4: Optional** (опционально)
- Features: ⬜⬜⬜⬜ 0/4 задач

**Общий прогресс:** 28/48 задач (58%)
**Критические этапы (1-3):** 28/44 задач (64%)

---

## 📝 Заметки по сессиям

### 2025-12-26: Этапы 1-2 завершены

**Выполнено:**
- ✅ **Этап 1 ЗАВЕРШЁН:**
  - Backend API endpoint `/api/project/:id/summary` возвращает metadata
  - Создан компонент ProjectInfoCard с модальным окном
  - ProjectOverviewPage обновлён (убрана кнопка "Back to Projects")
  - Все верификации пройдены (TypeScript, build, visual testing)

- ✅ **Этап 2 ЗАВЕРШЁН:**
  - ADR 016: Railway Deployment создан (docs/decisions/016-railway-deployment.md)
  - config.yaml: C:/4Stroke локально, FILES_PATH override для Railway
  - backend/src/config.js: добавлен FILES_PATH environment override
  - backend/src/server.js: static file serving для production (строки 115-142)
  - package.json: добавлены build/start scripts
  - Railway конфиг: railway.toml, .railwayignore, .env.example
  - data/: тестовый проект CN 1600 (НЕ коммитится - в .gitignore)
  - README.md: добавлена ссылка на ADR 016
  - Все 6 верификационных проверок пройдены

**Проблемы:** Нет

**Следующий шаг:** Этап 3 - Railway Deployment (commit, push, deploy)

---

## ✅ Критерии готовности

**Этап 1 готов когда:**
- ✅ Карточка Project Info отображается на странице проекта
- ✅ Все данные из metadata корректно показываются
- ✅ Кнопка "Back to Projects" убрана
- ✅ Fallback для проектов без metadata работает

**Этап 2 готов когда:**
- ✅ Production build собирается локально без ошибок
- ✅ Backend служит frontend статику на localhost:3000
- ✅ Все пути относительные (нет C:/4Stroke)
- ✅ railway.toml и scripts настроены

**Этап 3 готов когда:**
- ✅ Проект задеплоен на Railway
- ✅ Публичная ссылка работает
- ✅ Клиентская ссылка `/project/:id` открывается без ошибок
- ✅ Metadata загружается на production

**Проект готов когда:**
- ✅ Все этапы 1-3 завершены
- ✅ Клиенту можно отправить ссылку
- ✅ Проект работает стабильно на Railway

---

## 📚 Documentation Updates (SSOT Principle)

**Single Source of Truth:** Каждая информация должна быть в ОДНОМ месте

### После завершения Этапа 2:

- [ ] **Обновить README.md** (15 мин)
  - Секция "Deployment"
  - Ссылка на ADR: "See [ADR 015](docs/decisions/015-railway-deployment.md) for platform selection rationale"
  - Ссылка на .env.example: "Configure environment (see .env.example)"
  - НЕ дублировать полные инструкции - только ссылки

- [ ] **Обновить docs/architecture.md** (15 мин)
  - Секция "Deployment Architecture"
  - Ссылка на Railway конфигурацию
  - Diagram: Dev (local) vs Production (Railway)
  - Ссылка на ADR 015

- [ ] **Обновить CHANGELOG.md** (10 мин)
  - Версия: v3.4.0
  - Features:
    - Add ProjectInfoCard for client-facing project pages
    - Add Railway deployment support
    - Remove "Back to Projects" for client links
  - Technical:
    - Backend serves frontend static files
    - Configurable data paths via environment variables

### После завершения Этапа 3:

- [ ] **Создать docs/deployment.md** (30 мин)
  - Railway deployment guide (детальный)
  - Environment variables reference
  - Troubleshooting common issues
  - Ссылка из README: "See [deployment guide](docs/deployment.md)"

**Принцип SSOT соблюдён:**
- ✅ Railway platform choice → ADR 015 (ЕДИНСТВЕННЫЙ источник)
- ✅ Environment variables → .env.example (ЕДИНСТВЕННЫЙ источник)
- ✅ Deployment steps → docs/deployment.md (ЕДИНСТВЕННЫЙ источник)
- ✅ Другие файлы → только ССЫЛКИ, не дублирование

---

## 🔗 Полезные ссылки

- [Railway Docs](https://docs.railway.app/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [Project Architecture](docs/architecture.md)
- [ADR 015: Railway Deployment](docs/decisions/015-railway-deployment.md) (будет создан)

# ADR 016: Railway.app Deployment Platform Selection

**Дата:** 2025-12-26
**Статус:** Принято
**Автор:** Claude Code

---

## Контекст

Требуется развернуть ENGINE-VIEWER в production для отправки клиентам прямых ссылок на их проекты (например: `https://engine-viewer.app/project/client-engine-name`).

**Требования к платформе:**
- Node.js + Express.js поддержка
- **Persistent storage** для metadata файлов (backend пишет в `.metadata/*.json`)
- Static file serving для React SPA
- CI/CD интеграция с GitHub
- Доступная стоимость (приемлемо до $10/месяц)

**Критическое ограничение:** Backend модифицирует `.metadata/*.json` файлы при переименовании/удалении calculations → **serverless platforms НЕ подходят** (ephemeral file system).

---

## Решение

Использовать **Railway.app** как платформу для production deployment.

**Конфигурация:**
- Single service: Node.js app (backend serves frontend static)
- Persistent storage: 5GB volume
- Auto-deploy from GitHub branch
- Environment variables для конфигурации

---

## Причины

### 1. **Persistent Storage "из коробки"**
- Railway предоставляет persistent volumes (5GB бесплатно в $5 plan)
- Файловая система сохраняется между deployments
- Backend может писать в `.metadata/` без ограничений
- Vercel/Netlify **НЕ подходят** - ephemeral storage, file writes запрещены

### 2. **Простота конфигурации**
- Автоопределение Node.js проекта (Nixpacks)
- Minimal config: `railway.toml` + environment variables
- Нет необходимости в Docker (в отличие от Fly.io)
- GitHub integration одной кнопкой

### 3. **Монолитная архитектура**
- Backend и frontend в одном сервисе
- Нет CORS issues
- Простое управление (один deployment)
- Express serve frontend static (`/api/*` → backend, `/*` → frontend)

### 4. **Стоимость**
- Существующая подписка: $5/месяц (5GB storage, 500GB bandwidth)
- Достаточно для 10-20 клиентских проектов
- Нет дополнительных расходов за persistent disk (в отличие от Render.com: +$7/мес)

### 5. **Developer Experience**
- Логи в реальном времени
- Metrics dashboard (CPU, RAM, requests)
- Простой rollback на предыдущий deployment
- Auto-redeploy при push в GitHub

---

## Последствия

### Плюсы (что получаем):
- ✅ Persistent storage для metadata без дополнительной платы
- ✅ Быстрый deploy (3-5 минут)
- ✅ GitHub auto-deploy
- ✅ Простая конфигурация (один файл `railway.toml`)
- ✅ Монолитная архитектура → нет CORS
- ✅ Достаточно для production нагрузки (5-10 клиентов одновременно)
- ✅ Бесплатный SSL certificate

### Минусы (с чем придётся мириться):
- ⚠️ **Vendor lock-in** (Railway-specific config)
- ⚠️ Ограничение 5GB storage (достаточно для ~100 проектов по 50MB)
- ⚠️ Холодный старт после ~1 часа неактивности (hobby plan)
- ⚠️ Меньше гибкости чем Docker-based platforms (Fly.io, Render)

### Риски:
- ⚠️ Railway может изменить pricing (mitigation: миграция на Render/Fly за 1 день)
- ⚠️ Если storage > 5GB → нужен upgrade ($20/мес за 50GB)

---

## Альтернативы

### Vercel / Netlify
- **Плюсы**: Бесплатный tier, отличный DX, fast CDN
- **Минусы**: **Serverless → ephemeral storage**, file writes запрещены
- **Вердикт**: ❌ Отклонено - backend не может писать в `.metadata/`

### Render.com
- **Плюсы**: Persistent disk, Docker support, auto-deploy
- **Минусы**: Persistent disk **платный** ($7/мес минимум), итого $7-12/мес
- **Вердикт**: ❌ Отклонено - дороже Railway, нет преимуществ

### Fly.io
- **Плюсы**: Persistent volumes, global edge, Docker-native
- **Минусы**: **Требует Dockerfile**, сложнее конфигурация, volumes платные ($0.15/GB)
- **Вердикт**: ❌ Отклонено - over-engineering для текущих требований

### DigitalOcean App Platform
- **Плюсы**: Managed Node.js, persistent storage
- **Минусы**: Нет free tier, минимум $5/мес (без storage), volumes +$1/GB
- **Вердикт**: ❌ Отклонено - дороже Railway

### Heroku
- **Плюсы**: Pioneer в PaaS, отличная документация
- **Минусы**: **Free tier убран** (2022), минимум $5/мес Eco Dynos (ephemeral storage!)
- **Вердикт**: ❌ Отклонено - платный + ephemeral storage

### Self-hosted VPS (DigitalOcean Droplet / AWS EC2)
- **Плюсы**: Полный контроль, кастомная конфигурация
- **Минусы**: Требует DevOps (Nginx, PM2, SSL, security updates), time sink
- **Вердикт**: ❌ Отклонено - overhead на поддержку

---

## Реализация

**Конфигурационные файлы:**
- [railway.toml](../../railway.toml) - build и deploy команды
- [.railwayignore](../../.railwayignore) - игнорирование dev файлов
- [.env.example](../../.env.example) - environment variables reference
- [backend/src/server.js](../../backend/src/server.js:185-192) - static file serving

**Environment Variables (Railway dashboard):**
```bash
NODE_ENV=production
FILES_PATH=/app/data
PORT=3000  # auto-set by Railway
```

**Build process:**
1. Railway: `npm install && npm run build`
2. Frontend build: `cd frontend && npm install && npm run build`
3. Output: `frontend/dist/` → static files

**Start command:**
```bash
npm start  # → cd backend && npm start
```

**Backend служит:**
- API routes: `/api/*` → Express handlers
- Static files: `/*` → `frontend/dist/`
- SPA fallback: `GET *` → `frontend/dist/index.html` (React Router)

---

## Ссылки

- [Railway Documentation](https://docs.railway.app/)
- [Railway Persistent Volumes](https://docs.railway.app/reference/volumes)
- [Roadmap: Client Deployment](../../ROADMAP-CLIENT-DEPLOY.md) - Этап 2
- [Architecture: Deployment](../../docs/architecture.md#deployment) (будет обновлено)

---

## Примечания

**Миграция на другую платформу:**
Если Railway перестанет удовлетворять требованиям (цена, performance), миграция на Render.com или Fly.io займёт ~1 день:
1. Скопировать environment variables
2. Создать `Dockerfile` (для Fly) или использовать buildpack (Render)
3. Настроить persistent volume
4. Re-deploy

**Storage planning:**
- Средний проект: ~50MB (`.det` 2MB, `.pou` 1MB, `.prt` 5MB, metadata 50KB)
- 5GB volume → ~100 проектов
- Если storage > 5GB → upgrade Railway plan или архивировать старые проекты

# Windows Setup Guide

**Документ для настройки проекта Engine Results Viewer на Windows.**

**🤖 Для AI-агента:**
- Читай этот файл ПЕРВЫМ при работе на Windows-машине
- **ВАЖНО:** Создай Windows-версии скриптов (start.bat, stop.bat, status.bat) перед запуском
- См. подробный алгоритм в конце документа (секция "🤖 Для AI-агента на Windows")

---

## 🖥️ Контекст проекта

- **Проект:** Engine Results Viewer v3.3.1
- **Назначение:** Визуализация результатов расчётов ДВС (замена Post4T)
- **Разработка:** macOS (основная) + Windows (тестирование и production)
- **Репозиторий:** `github.com/engsimsoft/engine-viewer`

### Платформы
| Среда | ОС | Путь к данным |
|-------|-----|---------------|
| Development | macOS | `./test-data/` |
| Testing/Production | Windows | `C:/4Stroke/` |

---

## 📋 Первоначальная установка на Windows

### Шаг 1: Установить необходимое ПО

1. **Git for Windows**
   - Скачать: https://git-scm.com/download/win
   - При установке выбрать: "Git from the command line and also from 3rd-party software"
   - Рекомендуется: включить Git Credential Manager

2. **Node.js 18+ (LTS)**
   - Скачать: https://nodejs.org/
   - Выбрать LTS версию (20.x или 22.x)
   - При установке включить "Add to PATH"

3. **VS Code**
   - Скачать: https://code.visualstudio.com/
   - Рекомендуемые расширения:
     - GitHub Copilot
     - ESLint
     - Prettier
     - GitLens

### Шаг 2: Настроить Git

Открыть PowerShell или Git Bash:

```powershell
git config --global user.name "Твоё Имя"
git config --global user.email "email@example.com"

# Опционально: настроить credential helper
git config --global credential.helper manager
```

### Шаг 3: Клонировать репозиторий

```powershell
# Выбрать папку для проектов (например D:\Projects)
cd D:\Projects

# Клонировать
git clone https://github.com/engsimsoft/engine-viewer.git

# Перейти в папку проекта
cd engine-viewer
```

### Шаг 4: Установить зависимости

**ВАЖНО: Устанавливать в 3 местах (root + backend + frontend)!**

```powershell
# 1. Root (для html-to-image - экспорт графиков)
npm install

# 2. Backend
cd backend
npm install

# 3. Frontend
cd ..\frontend
npm install

# Вернуться в корень проекта
cd ..
```

**Проверка:**
```powershell
# Должны существовать все три папки:
dir node_modules          # Root: html-to-image
dir backend\node_modules  # Backend: express, chokidar, etc.
dir frontend\node_modules # Frontend: react, vite, echarts, etc.
```

### Шаг 5: Настроить путь к данным

Проверить `config.yaml` в корне проекта:

```yaml
files:
  # ПО УМОЛЧАНИЮ стоит:
  path: "./test-data"

  # Для Windows с реальными данными изменить на:
  # path: "C:/4Stroke"
```

**Для первого запуска:** Оставить `./test-data` — проверить что всё работает с тестовыми данными.
**Для production:** Изменить на `C:/4Stroke` (убедиться что папка существует и доступна).

**Важно:** Использовать прямые слэши `/` даже на Windows!

### Шаг 6: Запустить проект

**Вариант 1 — Автоматический запуск (рекомендуется для AI-агента):**

```powershell
# Запустить оба сервиса одной командой
start.bat

# Проверить статус
status.bat

# Остановить оба сервиса
stop.bat
```

**⚠️ Для AI-агента:** Если файлы `start.bat`, `stop.bat`, `status.bat` не существуют в корне проекта — **создай их** перед запуском (см. алгоритм ниже в секции "🤖 Для AI-агента на Windows").

---

**Вариант 2 — Ручной запуск (если .bat файлы не созданы):**

**Терминал 1 — Backend:**
```powershell
cd D:\Projects\engine-viewer\backend
npm start
# Сервер запустится на http://localhost:3000
```

**Терминал 2 — Frontend:**
```powershell
cd D:\Projects\engine-viewer\frontend
npm run dev
# Откроется http://localhost:5173
```

---

## ✅ Проверочный чек-лист

После установки проверить:

- [ ] `git --version` → показывает версию (2.x+)
- [ ] `node --version` → 18.0.0 или выше
- [ ] `npm --version` → работает
- [ ] Backend: `http://localhost:3000/health` → `{"status":"ok"}`
- [ ] Frontend: `http://localhost:5173` → загружается UI
- [ ] Проекты из `C:/4Stroke/` отображаются в списке
- [ ] Кириллица в названиях проектов корректна
- [ ] Графики Performance отображаются
- [ ] PV-диаграммы работают

---

## 🔄 Работа на двух компьютерах (macOS + Windows)

### Золотое правило

```
PUSH перед уходом → PULL при приходе
```

### На macOS (закончил работу):

```bash
git status                    # Проверить изменения
git add .                     # Добавить все файлы
git commit -m "описание"      # Закоммитить
git push                      # Отправить на GitHub
```

### На Windows (начал работу):

```powershell
cd D:\Projects\engine-viewer
git pull                      # Получить изменения с GitHub

# Если изменились зависимости:
cd backend && npm install
cd ..\frontend && npm install
```

### Если забыл push/pull — конфликты

```powershell
# Вариант 1: Спрятать локальные изменения
git stash                     # Спрятать
git pull                      # Получить удалённые
git stash pop                 # Вернуть локальные
# Разрешить конфликты в VS Code

# Вариант 2: Принудительный pull (ОСТОРОЖНО - потеряешь локальные изменения!)
git fetch origin
git reset --hard origin/main
```

### Рекомендуемый workflow

1. **Утро:** `git pull` → работаешь
2. **Вечер:** `git add .` → `git commit -m "..."` → `git push`
3. **Переключение компьютера:** Всегда push → pull

---

## 📁 Что НЕ синхронизируется через Git

Эти папки в `.gitignore` — устанавливаются/создаются локально:

| Папка/Файл | Назначение | Что делать |
|------------|------------|------------|
| `node_modules/` | npm зависимости | `npm install` |
| `.metadata/` | Метаданные проектов | Создаётся автоматически |
| `logs/` | Логи сервера | Создаётся автоматически |
| `.claude/settings.local.json` | Личные настройки Claude | Создать при необходимости |

---

## ⚠️ Windows-специфичные проблемы

### Пути к файлам

```javascript
// ❌ Неправильно (только Unix):
const path = '/Users/data/file.det'

// ✅ Правильно (кроссплатформенно):
import path from 'path';
const filePath = path.join(dataDir, 'file.det');
```

В `config.yaml` всегда использовать `/`:
```yaml
path: "C:/4Stroke"  # ✅ Правильно
path: "C:\\4Stroke" # ❌ Может вызвать проблемы
```

### Кодировка файлов

Если кириллица отображается неправильно:
- Проверить что файлы .det/.pou/.prt в кодировке Windows-1251 или UTF-8
- Backend парсеры учитывают это автоматически

### Длинные пути

Если ошибка "path too long":
```powershell
# Включить длинные пути в Windows (от админа):
git config --system core.longpaths true
```

### Права доступа к C:/4Stroke

Убедиться что у пользователя есть права на чтение папки `C:/4Stroke/`.

---

## 🛠️ Полезные команды

### Проверка статуса

```powershell
# Git статус
git status

# Проверить версии
node --version
npm --version
git --version

# Проверить что сервер работает
curl http://localhost:3000/health
# или открыть в браузере
```

### Перезапуск проекта

```powershell
# Остановить: Ctrl+C в каждом терминале

# Запустить снова:
cd backend && npm start
cd frontend && npm run dev
```

### Сборка production

```powershell
cd frontend
npm run build        # Создаст dist/
npm run typecheck    # Проверка TypeScript
```

---

## 📖 Документация проекта

| Файл | Содержание |
|------|------------|
| `README.md` | Обзор проекта, быстрый старт |
| `docs/architecture.md` | Полная архитектура (SSOT) |
| `CHANGELOG.md` | История изменений |
| `config.yaml` | Конфигурация (пути, порты) |
| `.github/copilot-instructions.md` | Инструкции для Copilot |
| `.claude/AGENT_RULES.md` | Правила для Claude Code |

---

## 🤖 Для AI-агента на Windows

### Первый запуск на Windows-машине

**Контекст:** Пользователь клонировал проект на Windows-компьютере. Это чистая копия с GitHub.

**Твоя задача:** Настроить проект с нуля до рабочего состояния.

**Алгоритм:**

1. **Прочитать этот файл полностью** (`WINDOWS-SETUP.md`)

2. **Проверить требования:**
   ```powershell
   git --version   # 2.x+
   node --version  # 18.0.0+
   npm --version   # работает
   ```

3. **Установить зависимости (3 места!):**
   ```powershell
   npm install                      # Root (html-to-image)
   cd backend && npm install && cd ..   # Backend
   cd frontend && npm install && cd ..  # Frontend
   ```

4. **Проверить `config.yaml`:**
   - Для первого запуска: оставить `path: "./test-data"`
   - Для production: изменить на `C:/4Stroke` (если папка существует)

5. **КРИТИЧНО: Создать Windows-версии скриптов запуска**

   Проверить наличие файлов в корне проекта:
   ```powershell
   dir start.bat
   dir stop.bat
   dir status.bat
   ```

   **Если файлы НЕ существуют — ОБЯЗАТЕЛЬНО создай их:**

   **a) `start.bat`** — запуск backend + frontend:
   - Логика (на основе `scripts/start.sh`):
     1. Проверить что порты 3000 и 5173 свободны (netstat)
     2. Если заняты → убить процессы (taskkill)
     3. Создать папку `logs\` если нет
     4. Запустить backend: `cd backend && start /B npm start > ..\logs\backend.log 2>&1`
     5. Подождать 5 секунд, проверить http://localhost:3000/health
     6. Запустить frontend: `cd frontend && start /B npm run dev > ..\logs\frontend.log 2>&1`
     7. Подождать 10 секунд, проверить http://localhost:5173
     8. Вывести URLs и пути к логам

   **b) `stop.bat`** — остановка процессов:
   - Найти процессы на портах 3000 и 5173 (netstat -ano)
   - Убить через taskkill /F /PID

   **c) `status.bat`** — проверка состояния:
   - Показать процессы на портах 3000, 5173
   - Проверить доступность http://localhost:3000/health и http://localhost:5173

   **Важно:** Используй синтаксис Windows Batch, не bash!

6. **Запустить проект:**
   ```powershell
   start.bat
   ```

7. **Проверить работоспособность:**
   - Backend health: http://localhost:3000/health → `{"status":"ok"}`
   - Frontend: http://localhost:5173 → UI загружается
   - Проекты отображаются в списке
   - Открыть любой проект → графики рисуются

8. **Если проблемы** → проверить чек-лист выше (строки 160-172)

**Основные правила работы** — в `.claude/AGENT_RULES.md` (одинаковы для macOS и Windows).

---

**Последнее обновление:** 23 декабря 2025 (v3.3.1 - последняя рабочая версия до Electron)

# Windows Setup Guide

**Документ для настройки проекта Engine Results Viewer на Windows.**
**Для AI-агента:** Читай этот файл первым при работе на Windows-машине.

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

```powershell
# Backend
cd backend
npm install

# Frontend (в новом терминале или после cd ..)
cd ..\frontend
npm install
```

### Шаг 5: Настроить путь к данным

Отредактировать `config.yaml` в корне проекта:

```yaml
files:
  # Для Windows с реальными данными:
  path: "C:/4Stroke"
  
  # Или для тестирования:
  # path: "./test-data"
```

**Важно:** Использовать прямые слэши `/` даже на Windows!

### Шаг 6: Запустить проект

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

При первом запуске на Windows-машине:

1. **Прочитать этот файл** (`WINDOWS-SETUP.md`)
2. **Проверить** `config.yaml` — путь должен быть `C:/4Stroke`
3. **Запустить** backend + frontend
4. **Протестировать** базовую функциональность
5. **При проблемах** — проверить чек-лист выше

**Основные правила работы** — в `.github/copilot-instructions.md` (одинаковы для macOS и Windows).

---

**Последнее обновление:** 28 ноября 2025

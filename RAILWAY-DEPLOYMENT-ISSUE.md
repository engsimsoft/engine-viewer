# Railway Deployment Issue - FAILED BUILD

**Статус:** КРИТИЧЕСКАЯ ПРОБЛЕМА - деплой не работает
**Дата:** 26 декабря 2024
**Ветка:** `feature/client-deployment`
**Railway проект:** `supportive-serenity` / сервис `engine-viewer`

---

## ПРОБЛЕМА

Railway деплой падает на этапе build с ошибкой:

```
error: undefined variable 'nodejs-20_x'
at /app/.nixpacks/nixpkgs-ffaebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:9:
```

**Root cause:** Nixpacks не может найти пакет `nodejs-20_x` в своём репозитории nixpkgs.

---

## ЧТО УЖЕ ПРОБОВАЛИ (НЕ СРАБОТАЛО)

### Попытка 1: Использовали `nixpacks.toml`
- Создали `nixpacks.toml` с `nodejs-18_x`
- **Результат:** Railway игнорировал файл, использовал `railway.toml` вместо него

### Попытка 2: Добавили `--include=dev` в npm install
- Проблема: TypeScript не устанавливался (был в devDependencies)
- **Результат:** `tsc: not found` ошибка при билде frontend

### Попытка 3: Обернули команды в subshells
```toml
cmds = ['(cd frontend && npm install --include=dev)']
```
- **Результат:** Не помогло, Railway продолжал использовать railway.toml

### Попытка 4: Обновили до Node 20
- Изменили `nixpacks.toml`: `nodejs-18_x` → `nodejs-20_x`
- **Результат:** FAILED - nixpkgs не содержит `nodejs-20_x`

### Попытка 5: Исправили railway.toml buildCommand
```toml
buildCommand = "npm install --include=dev && (cd backend && npm install --include=dev) && (cd frontend && npm install --include=dev) && (cd frontend && npm run build)"
```
- **Результат:** Railway всё равно использует nix-env, падает на `nodejs-20_x`

---

## ТЕКУЩЕЕ СОСТОЯНИЕ ФАЙЛОВ

### nixpacks.toml (ПРОБЛЕМНЫЙ)
```toml
[phases.setup]
nixPkgs = ['nodejs-20_x']  # ❌ ОШИБКА: пакет не существует

[phases.install]
cmds = [
  'npm install --include=dev',
  '(cd backend && npm install --include=dev)',
  '(cd frontend && npm install --include=dev)'
]

[phases.build]
cmds = ['(cd frontend && npm run build)']

[start]
cmd = 'cd backend && npm start'
```

### railway.toml (ИСПОЛЬЗУЕТСЯ RAILWAY)
```toml
[build]
  builder = "nixpacks"
  buildCommand = "npm install --include=dev && (cd backend && npm install --include=dev) && (cd frontend && npm install --include=dev) && (cd frontend && npm run build)"

[deploy]
  startCommand = "npm start"
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 10
```

### Environment Variables (НАСТРОЕНЫ)
```
NODE_ENV=production
HOST=0.0.0.0
FILES_PATH=/app/data
```

---

## ТРЕБОВАНИЯ ПРОЕКТА

1. **Node.js версия:** Frontend требует Node 20+ (Vite 7, React Router 7)
   - `@vitejs/plugin-react@5.1.2` требует `^20.19.0 || >=22.12.0`
   - `vite@7.3.0` требует `^20.19.0 || >=22.12.0`
   - `react-router@7.11.0` требует `>=20.0.0`

2. **devDependencies:** TypeScript, Vite должны устанавливаться для build

3. **Монорепа структура:**
   ```
   /
   ├── backend/
   │   └── package.json
   ├── frontend/
   │   └── package.json (содержит typescript в devDeps)
   └── package.json (root)
   ```

---

## ПРАВИЛЬНОЕ РЕШЕНИЕ (НУЖНО РЕАЛИЗОВАТЬ)

**НЕ ИСПОЛЬЗУЙ nixpacks.toml!** Railway его игнорирует.

### Вариант A: Использовать railway.toml с правильным builder

Проверить документацию Railway 2024-2025:
1. Какой правильный способ указать Node.js версию в `railway.toml`?
2. Нужно ли вообще указывать nixpacks builder или Railway автодетектит?
3. Может есть другой способ указать Node version (через `.nvmrc` или `package.json`)?

### Вариант B: Удалить оба .toml файла, использовать автодетект

Railway может автоматически определить Node.js проект. Попробовать:
1. Удалить `nixpacks.toml` и `railway.toml`
2. Создать `.nvmrc` с версией `20`
3. Настроить только environment variables

---

## ЛОГИ ПОСЛЕДНЕЙ ОШИБКИ

```
[stage-0 4/12] RUN nix-env -if .nixpacks/nixpkgs-ffaebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d

error: undefined variable 'nodejs-20_x'
at /app/.nixpacks/nixpkgs-ffaebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:9:
    18|       '')
    19|       nodejs-20_x
      |         ^
    20|   ];
```

---

## ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Railway использует Nixpacks** - это build system на базе Nix
2. **Node 18 устарел** - но `nodejs-20_x` не существует в nixpkgs
3. **Нужна правильная версия пакета** - возможно `nodejs-20` или `nodejs_20` (без _x)
4. **Railway.toml приоритетнее nixpacks.toml** - Railway читает railway.toml первым

---

## СЛЕДУЮЩИЕ ШАГИ ДЛЯ НОВОГО АГЕНТА

1. **WebFetch:** Изучи официальную документацию Railway 2024-2025
   - Как правильно указать Node.js версию?
   - Какие пакеты доступны в nixpkgs (список имён)?
   - Примеры рабочих railway.toml для Node.js 20+

2. **Выбери правильный подход:**
   - Либо исправь имя пакета в nixpacks.toml
   - Либо удали .toml файлы и используй автодетект + .nvmrc

3. **НЕ ПОВТОРЯЙ ОШИБКИ:**
   - НЕ меняй случайно файлы без проверки документации
   - НЕ используй устаревшую информацию из памяти
   - ПРОВЕРЬ что команды работают перед коммитом

---

## ФАЙЛЫ ДЛЯ ИЗУЧЕНИЯ

- [railway.toml](railway.toml) - используется Railway
- [nixpacks.toml](nixpacks.toml) - игнорируется Railway (можно удалить?)
- [frontend/package.json](frontend/package.json) - требования Node 20+
- [backend/src/config.js](backend/src/config.js) - FILES_PATH override
- [backend/src/server.js](backend/src/server.js) - static file serving

---

## КОММИТЫ С НЕУДАЧНЫМИ ПОПЫТКАМИ

- `e25abc7` - fix(railway): add nixpacks.toml (не сработало)
- `ac36797` - fix(nixpacks): install devDependencies (не сработало)
- `e6f46be` - fix(nixpacks): wrap cd commands in subshells (не сработало)
- `a76fecc` - fix(deploy): use Node 20 (FAILED - nodejs-20_x не существует)

---

**КРИТИЧНО:** Приложение production-ready локально, но Railway деплой сломан.

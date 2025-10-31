#!/bin/bash

# 🚀 Engine Results Viewer - Startup Script
# Запускает Backend (порт 3000) и Frontend (порт 5173)

set -e  # Остановка при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Engine Results Viewer - Starting..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Определяем корень проекта (поднимаемся на уровень выше если запущено из scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Проверка что мы в корне проекта
if [ ! -f "config.yaml" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Ошибка: Не найден корень проекта engine-viewer/${NC}"
    exit 1
fi

# Проверка что порты свободны
echo -e "${BLUE}📡 Проверка портов...${NC}"

if lsof -i :3000 -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Порт 3000 уже занят (Backend, возможно, уже запущен)${NC}"
    read -p "   Остановить старый процесс и продолжить? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -i :3000 -t | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}   ✓ Старый процесс остановлен${NC}"
        sleep 1
    else
        echo -e "${RED}   Отменено${NC}"
        exit 1
    fi
fi

if lsof -i :5173 -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Порт 5173 уже занят (Frontend, возможно, уже запущен)${NC}"
    read -p "   Остановить старый процесс и продолжить? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -i :5173 -t | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}   ✓ Старый процесс остановлен${NC}"
        sleep 1
    else
        echo -e "${RED}   Отменено${NC}"
        exit 1
    fi
fi

# Проверка что node_modules установлены
echo ""
echo -e "${BLUE}📦 Проверка зависимостей...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend зависимости не установлены${NC}"
    echo "   Устанавливаю..."
    cd backend && npm install && cd ..
    echo -e "${GREEN}   ✓ Backend зависимости установлены${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend зависимости не установлены${NC}"
    echo "   Устанавливаю..."
    cd frontend && npm install && cd ..
    echo -e "${GREEN}   ✓ Frontend зависимости установлены${NC}"
fi

# Создаём директорию для логов
mkdir -p logs

# Запуск Backend
echo ""
echo -e "${BLUE}🔧 Запуск Backend...${NC}"
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "   PID: ${BACKEND_PID}"
echo -e "   Лог: logs/backend.log"

# Ждём пока backend стартует
echo -e "   Ожидание запуска..."
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Backend запущен: http://localhost:3000${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}   ❌ Backend не запустился за 10 секунд${NC}"
        echo -e "   Проверьте лог: tail -f logs/backend.log"
        exit 1
    fi
    sleep 1
done

# Запуск Frontend
echo ""
echo -e "${BLUE}⚛️  Запуск Frontend...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo -e "   PID: ${FRONTEND_PID}"
echo -e "   Лог: logs/frontend.log"

# Ждём пока frontend стартует
echo -e "   Ожидание запуска..."
for i in {1..15}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Frontend запущен: http://localhost:5173${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}   ❌ Frontend не запустился за 15 секунд${NC}"
        echo -e "   Проверьте лог: tail -f logs/frontend.log"
        exit 1
    fi
    sleep 1
done

# Сохраняем PIDs в файл для stop.sh
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Итоговое сообщение
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Engine Results Viewer запущен успешно!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "📡 ${BLUE}Backend:${NC}  http://localhost:3000"
echo -e "⚛️  ${BLUE}Frontend:${NC} http://localhost:5173"
echo ""
echo -e "📋 Логи:"
echo -e "   Backend:  tail -f logs/backend.log"
echo -e "   Frontend: tail -f logs/frontend.log"
echo ""
echo -e "🛑 Остановка: ${YELLOW}./scripts/stop.sh${NC}"
echo -e "🔄 Перезапуск: ${YELLOW}./scripts/restart.sh${NC}"
echo -e "📊 Статус:    ${YELLOW}./scripts/status.sh${NC}"
echo ""

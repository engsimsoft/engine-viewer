#!/bin/bash

# 🛑 Engine Results Viewer - Stop Script
# Останавливает Backend и Frontend

# Определяем корень проекта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛑 Engine Results Viewer - Stopping..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

STOPPED_COUNT=0

# Остановка по сохранённым PIDs
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${BLUE}🔧 Остановка Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || kill -9 $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}   ✓ Backend остановлен${NC}"
        ((STOPPED_COUNT++))
    fi
    rm .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${BLUE}⚛️  Остановка Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || kill -9 $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}   ✓ Frontend остановлен${NC}"
        ((STOPPED_COUNT++))
    fi
    rm .frontend.pid
fi

# Дополнительная проверка - убиваем всё на портах 3000 и 5173
echo ""
echo -e "${BLUE}🔍 Проверка портов 3000 и 5173...${NC}"

if lsof -i :3000 -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   ⚠️  Найдены процессы на порту 3000${NC}"
    lsof -i :3000 -t | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}   ✓ Порт 3000 освобождён${NC}"
    ((STOPPED_COUNT++))
fi

if lsof -i :5173 -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   ⚠️  Найдены процессы на порту 5173${NC}"
    lsof -i :5173 -t | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}   ✓ Порт 5173 освобождён${NC}"
    ((STOPPED_COUNT++))
fi

# Убиваем все node процессы связанные с проектом (альтернативный метод)
PROJECT_DIR=$(pwd)
BACKEND_PIDS=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')
FRONTEND_PIDS=$(ps aux | grep "vite" | grep -v grep | awk '{print $2}')

if [ ! -z "$BACKEND_PIDS" ]; then
    echo -e "${YELLOW}   ⚠️  Найдены backend процессы: $BACKEND_PIDS${NC}"
    echo "$BACKEND_PIDS" | xargs kill -9 2>/dev/null || true
    ((STOPPED_COUNT++))
fi

if [ ! -z "$FRONTEND_PIDS" ]; then
    echo -e "${YELLOW}   ⚠️  Найдены frontend процессы: $FRONTEND_PIDS${NC}"
    echo "$FRONTEND_PIDS" | xargs kill -9 2>/dev/null || true
    ((STOPPED_COUNT++))
fi

# Итоговое сообщение
echo ""
if [ $STOPPED_COUNT -gt 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Engine Results Viewer остановлен${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}ℹ️  Процессы не найдены (уже остановлено)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""
echo -e "🚀 Запуск: ${YELLOW}./scripts/start.sh${NC}"
echo ""

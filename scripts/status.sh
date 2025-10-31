#!/bin/bash

# 📊 Engine Results Viewer - Status Check
# Проверяет статус Backend и Frontend

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
echo "📊 Engine Results Viewer - Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка Backend
echo -e "${BLUE}🔧 Backend (http://localhost:3000):${NC}"

if lsof -i :3000 -t >/dev/null 2>&1; then
    BACKEND_PID=$(lsof -i :3000 -t | head -1)
    echo -e "   Статус: ${GREEN}✅ Работает${NC}"
    echo -e "   PID:    $BACKEND_PID"

    # Проверка health endpoint
    if HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null); then
        UPTIME=$(echo $HEALTH | grep -o '"uptime":[0-9.]*' | cut -d: -f2)
        if [ ! -z "$UPTIME" ]; then
            UPTIME_MIN=$(echo "$UPTIME / 60" | bc -l | xargs printf "%.1f")
            echo -e "   Uptime: ${UPTIME_MIN} мин"
        fi
        echo -e "   Health: ${GREEN}OK${NC}"
    else
        echo -e "   Health: ${RED}ERROR${NC} (не отвечает)"
    fi

    # Показываем последние 3 строки лога
    if [ -f "logs/backend.log" ]; then
        echo -e "   Лог:    (последние 3 строки)"
        tail -3 logs/backend.log | sed 's/^/           /'
    fi
else
    echo -e "   Статус: ${RED}❌ Остановлен${NC}"
fi

echo ""

# Проверка Frontend
echo -e "${BLUE}⚛️  Frontend (http://localhost:5173):${NC}"

if lsof -i :5173 -t >/dev/null 2>&1; then
    FRONTEND_PID=$(lsof -i :5173 -t | head -1)
    echo -e "   Статус: ${GREEN}✅ Работает${NC}"
    echo -e "   PID:    $FRONTEND_PID"

    # Проверка доступности
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "   HTTP:   ${GREEN}OK${NC}"
    else
        echo -e "   HTTP:   ${RED}ERROR${NC} (не отвечает)"
    fi

    # Показываем последние 3 строки лога
    if [ -f "logs/frontend.log" ]; then
        echo -e "   Лог:    (последние 3 строки)"
        tail -3 logs/frontend.log | sed 's/^/           /'
    fi
else
    echo -e "   Статус: ${RED}❌ Остановлен${NC}"
fi

echo ""

# Проверка PID файлов
echo -e "${BLUE}📋 Сохранённые PIDs:${NC}"
if [ -f ".backend.pid" ]; then
    SAVED_BACKEND=$(cat .backend.pid)
    if ps -p $SAVED_BACKEND > /dev/null 2>&1; then
        echo -e "   Backend:  $SAVED_BACKEND ${GREEN}(активен)${NC}"
    else
        echo -e "   Backend:  $SAVED_BACKEND ${RED}(не найден)${NC}"
    fi
else
    echo -e "   Backend:  ${YELLOW}нет${NC}"
fi

if [ -f ".frontend.pid" ]; then
    SAVED_FRONTEND=$(cat .frontend.pid)
    if ps -p $SAVED_FRONTEND > /dev/null 2>&1; then
        echo -e "   Frontend: $SAVED_FRONTEND ${GREEN}(активен)${NC}"
    else
        echo -e "   Frontend: $SAVED_FRONTEND ${RED}(не найден)${NC}"
    fi
else
    echo -e "   Frontend: ${YELLOW}нет${NC}"
fi

echo ""

# Проверка логов
echo -e "${BLUE}📁 Логи:${NC}"
if [ -d "logs" ]; then
    if [ -f "logs/backend.log" ]; then
        BACKEND_LOG_SIZE=$(du -h logs/backend.log | cut -f1)
        echo -e "   Backend:  logs/backend.log (${BACKEND_LOG_SIZE})"
    else
        echo -e "   Backend:  ${YELLOW}нет${NC}"
    fi

    if [ -f "logs/frontend.log" ]; then
        FRONTEND_LOG_SIZE=$(du -h logs/frontend.log | cut -f1)
        echo -e "   Frontend: logs/frontend.log (${FRONTEND_LOG_SIZE})"
    else
        echo -e "   Frontend: ${YELLOW}нет${NC}"
    fi
else
    echo -e "   ${YELLOW}Директория logs/ не существует${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "🚀 Запуск:     ${YELLOW}./scripts/start.sh${NC}"
echo -e "🛑 Остановка:  ${YELLOW}./scripts/stop.sh${NC}"
echo -e "🔄 Перезапуск: ${YELLOW}./scripts/restart.sh${NC}"
echo ""

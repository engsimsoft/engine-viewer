#!/bin/bash

# Скрипт для проверки ссылок в Markdown файлах
# Проверяет существование файлов, на которые ссылаются документы

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Счётчики
total_links=0
broken_links=0
valid_links=0

echo "🔍 Проверка ссылок в документации..."
echo ""

# Функция для проверки относительной ссылки
check_link() {
    local doc_file=$1
    local link=$2
    local doc_dir=$(dirname "$doc_file")
    
    # Убираем якорь (#...) если есть
    local clean_link=$(echo "$link" | sed 's/#.*//')
    
    # Декодируем URL-encoded символы (%20 → пробел)
    clean_link=$(echo "$clean_link" | sed 's/%20/ /g')
    
    # Игнорируем внешние ссылки (http/https)
    if [[ "$clean_link" =~ ^https?:// ]]; then
        return 0
    fi
    
    # Пропускаем пустые ссылки
    if [ -z "$clean_link" ]; then
        return 0
    fi
    
    # Формируем полный путь к файлу
    if [[ "$clean_link" =~ ^\/ ]]; then
        # Абсолютный путь от корня проекта
        local full_path=".$clean_link"
    else
        # Относительный путь
        local full_path="$doc_dir/$clean_link"
    fi
    
    # Проверяем существование файла
    if [ -f "$full_path" ] || [ -d "$full_path" ]; then
        echo -e "${GREEN}✓${NC} $link"
        ((valid_links++))
    else
        echo -e "${RED}✗${NC} $link → не найден: $full_path"
        ((broken_links++))
    fi
    
    ((total_links++))
}

# Список документов для проверки (исключая node_modules)
docs=(
    "README.md"
    "CLAUDE.md"
    "CHANGELOG.md"
    "roadmap.md"
    "docs/setup.md"
    "docs/architecture.md"
    "docs/api.md"
    "docs/troubleshooting.md"
    "docs/parsers-guide.md"
    "docs/file-formats/README.md"
    "docs/file-formats/det-format.md"
    "docs/decisions/template.md"
    "docs/decisions/001-det-file-format.md"
    "scripts/README.md"
)

# Проверяем каждый документ
for doc in "${docs[@]}"; do
    if [ ! -f "$doc" ]; then
        echo -e "${YELLOW}⚠${NC} Файл не найден: $doc"
        continue
    fi
    
    echo ""
    echo "📄 $doc"
    
    # Извлекаем все Markdown ссылки вида [text](link) с помощью sed
    sed -n 's/.*\[.*\](\([^)]*\)).*/\1/p' "$doc" | while read -r link; do
        check_link "$doc" "$link"
    done
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Итоги проверки:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Всего ссылок: $total_links"
echo -e "  ${GREEN}Корректных: $valid_links${NC}"
echo -e "  ${RED}Битых: $broken_links${NC}"
echo ""

if [ $broken_links -eq 0 ]; then
    echo -e "${GREEN}✅ Все ссылки корректны!${NC}"
    exit 0
else
    echo -e "${RED}❌ Найдены битые ссылки!${NC}"
    exit 1
fi

# EngMod4T Suite - Documentation (Markdown)

**Источник:** Dat4THelp.chm (извлечено и конвертировано в Markdown)
**Дата конвертации:** 5 ноября 2025
**Формат:** Один файл на главу для удобства копирования в Claude Chat

---

## 📚 Структура документации

### Глава 1: [Introduction to Dat4T](01-Introduction-to-Dat4T.md) (16 KB)
- Front Page - обзор Dat4T
- License Agreement
- Disclaimer
- Folder Structure - структура папок C:\4Stroke
- **Project Layout** - структура проекта (.pjt, .eng, .exp, .ipo, .exl, .ind, .cbd, .tmp, .trb, **`.prt`**)
- Windows Nomenclature
- Error Handling

**👉 Для задачи с .prt версионированием - смотри этот раздел!**

---

### Глава 2: [Starting Dat4T](02-Starting-Dat4T.md) (15 KB)
- Starting the Program
- Create a new Project
- Open an existing Project
- Creating New Subsystem
- Editing a Subsystem
- Creating or Extracting an Archive
- Dialog Box Error
- Factors affecting run time duration

---

### Глава 3: [Engine Data](03-Engine-Data.md) (15 KB)
- Create New Engine
- Edit Existing Engine
- Cylinder Numbering Sequence
- Exhaust Trace Position
- Inlet Trace Position

---

### Глава 4: [Turbocharger or Supercharger Data](04-Turbocharger-Supercharger.md) (11 KB)
- Turbocharger Modeling
- Supercharger Modeling

---

### Глава 5: [Ports, Valves and Lift Profiles](05-Ports-Valves-Lift-Profiles.md) (59 KB)
- Flow modeling through Valves and Ports
- Specifying VVT and/or VVL
- Exhaust Cam, Ports and Valves
  - Port and Valve data with Generated Cam Profile
  - Port and Valve Data with Imported Cam Profile
  - User Defined Cd-Map
- Inlet Cam, Ports and Valves
  - New User Defined Cam, Ports and Valves
  - New Imported Cam, Port and Valves
  - User Defined Cd-Map

---

### Глава 6: [Exhaust Subsystem](06-Exhaust-Subsystem.md) (63 KB)
- Exhaust Pipe Nomenclature and Boundaries
- Exhaust Pipe Numbering Convention
- Exhaust Collector Modeling
- Stepped pipes
- Exhaust Boxes
- Types of Exhaust systems
- Types of Turbocharger Exhaust Systems
- Create New Exhaust System
- Design new Exhaust System
- Modeling Siamesed Exhaust Port System
- Edit Existing Exhaust
- Exhaust Modeling Error
- Catalytic Converters
- **Silencers** (7 типов глушителей)

---

### Глава 7: [Intake Subsystem](07-Intake-Subsystem.md) (56 KB)
- Intake Pipe Numbering Convention
- Inlet Length Correction
- Throttles
- Inlet Collectors
- Inlet Boxes or Plenums
- Variable Inlet Length
- Types of Intake systems
- V8 Special Inlets
- Types of Turbo- and Supercharger Inlet Systems
- Intercooler Modeling
- Create New Inlet System
- Modeling Siamesed Inlet Port Systems
- Edit Existing Inlet
- Inlet System Modeling Error

---

### Глава 8: [Combustion and Ignition Subsystem](08-Combustion-Ignition.md) (25 KB)
- Turbulent Combustion
- Spark Ignition Combustion Subsystem
- Compression Ignition Combustion Subsystem
- Edit Existing Combustion and Ignition Data

---

### Глава 9: [Surface Temperatures and Atmospheric conditions](09-Temperatures-Atmospheric.md) (5.2 KB)
- Create and Edit Temperatures

---

### Глава 10: [Design Verification](10-Design-Verification.md) (4.3 KB)
- Design Checking and STA

---

### Глава 11: [References](11-References.md) (607 B)
- References (Professor Emeritus Gordon P Blair)

---

## 🎯 Как использовать для Claude Chat

**Вариант 1: Копировать нужную главу целиком**
```bash
# Открой файл в VSCode
code _personal/markdown-chapters/01-Introduction-to-Dat4T.md

# Или прочитай в терминале
cat _personal/markdown-chapters/01-Introduction-to-Dat4T.md

# Скопируй всё содержимое и вставь в Claude Chat
```

**Вариант 2: Ссылка на GitHub**
```
https://github.com/engsimsoft/engine-viewer/tree/main/_personal/markdown-chapters
```

**Вариант 3: Объединить несколько глав**
```bash
# Например, объединить главы 1-3
cat 01-Introduction-to-Dat4T.md 02-Starting-Dat4T.md 03-Engine-Data.md > combined.md
```

---

## 📋 Для задачи с .prt версионированием

**Обязательно покажите Claude Chat:**
1. ✅ **Глава 1: Introduction** (раздел "Project Layout") - структура файлов
2. ✅ `_personal/prt-versioning-architecture.md` - техническая спецификация
3. ✅ `_personal/Performance Output Data.md` - описание параметров .pou

**Дополнительно (если нужно):**
4. Глава 2: Starting Dat4T - как работает workflow
5. Глава 3: Engine Data - параметры двигателя

---

## 🔍 Примечания

- **Изображения:** Ссылки на изображения сохранены в формате `../Pictures/filename.jpg`
- **Кодировка:** Некоторые HTML файлы были в Windows-1252 (latin1) - автоматически конвертировано
- **Формат:** Markdown совместим с GitHub Flavored Markdown (GFM)
- **Размер:** Общий размер всех глав: ~270 KB (текст)

---

**Документация готова к использованию!** 🚀

Скопируй нужную главу в Claude Chat для обсуждения задачи по .prt версионированию.

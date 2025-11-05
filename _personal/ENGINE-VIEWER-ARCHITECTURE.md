# 🏗️ Engine Viewer - Архитектурная спецификация

**Проект:** Engine Viewer - современный веб-визуализатор для EngMod4T  
**Версия документа:** 1.0  
**Дата:** 4 ноября 2025  
**Статус:** 🟢 Утверждённый черновик

---

## 📋 Executive Summary

**Engine Viewer** - современная система для визуализации результатов расчётов двигателей внутреннего сгорания, заменяющая устаревший Post4T визуализатор.

### Ключевые цели проекта:
- ✅ Замена Post4T на современный интерфейс
- ✅ Интерактивные графики (уже реализовано!)
- ✅ **Автоматическое версионирование конфигураций** (новая функция)
- ✅ **Генерация профессиональных отчётов** для клиентов
- ✅ Масштабируемая архитектура (desktop → web)

### Стратегия развития:

**🎯 ФАЗА 1 (СЕЙЧАС): Engineer App**
- Desktop приложение (Electron/Node.js)
- Работает offline, доступ к C:/4Stroke/
- Для работы инженера с клиентами
- Генерация финальных отчётов

**🚀 ФАЗА 2 (БУДУЩЕЕ): Client Portal**
- Web SaaS приложение
- Клиенты заказывают проекты онлайн
- Доступ к результатам через интернет
- **Переиспользуем код из Engineer App!**

### Коммерческая модель:
- **Engineer App:** Инструмент для инженера (единовременная покупка или бесплатно)
- **Client Portal:** Оплата за проект клиентами ($XXX за проект)

---

## 🎯 Две системы: Engineer App и Client Portal

### Стратегия "Build Once, Scale Later"

Проект развивается в **две фазы**, с общим технологическим стеком для переиспользования кода:

### 1️⃣ **Engineer App** (Desktop, ФАЗА 1 - СЕЙЧАС)

**Назначение:** Инструмент для инженера

**Технологии:**
- Electron + Node.js 18 + Express
- React 18 + TypeScript
- ECharts (графики)
- Работает **offline**

**Workflow инженера:**
```
1. Встреча с клиентом
   └─> Записал требования (диаметр поршня, ход, распредвал, система впуска...)

2. Получение недостающих данных
   ├─> Продувка ГБЦ на оборудовании (flowbench data)
   └─> Измерение профиля распредвала на станках

3. DAT4T: Сборка проекта
   └─> Создал ProjectName.prt (конфигурация)

4. EngMod4T: Расчёты
   └─> 10-15 расчётов с разными параметрами

5. Engine Viewer (Engineer App): Анализ
   ├─> Визуализация графиков
   ├─> Configuration History (сравнение вариантов)
   └─> Выбор оптимального варианта

6. Engine Viewer: Генерация финального отчёта
   ├─> Полные размеры системы выпуска (header, collector, диаметры)
   ├─> Полные размеры системы впуска (ITB/IM, длины, диаметры)
   ├─> Графики результатов (Power, Torque, Efficiency)
   ├─> Рекомендации по реализации
   └─> Экспорт в PDF (профессиональный отчёт)

7. Отправка отчёта клиенту
   └─> Email/печать
```

**Функции:**
- ✅ Сканирование C:/4Stroke/ (все проекты)
- ✅ Визуализация графиков (.det/.pou)
- ✅ Configuration History (версионирование .prt)
- ✅ Configuration Diff (сравнение конфигураций)
- ✅ **Генерация финального отчёта для клиента (PDF)**
- ✅ Project metadata (информация о клиенте, требования)
- ✅ Работает offline (без интернета)

---

### 2️⃣ **Client Portal** (Web SaaS, ФАЗА 2 - БУДУЩЕЕ)

**Назначение:** Платформа для клиентов

**Технологии:**
- **React 18 + TypeScript** (переиспользуем из Engineer App!)
- **ECharts** (те же графики!)
- Cloud Backend (Node.js + Express + Database)
- Authentication, Payment processing

**Workflow клиента:**
```
1. Заходит на сайт engineviewer.com
   └─> Регистрация/логин

2. Заполняет анкету (новый заказ)
   └─> Требования к двигателю, бюджет, сроки

3. Оплата проекта
   └─> Stripe/PayPal ($XXX)

4. Чат с инженером
   └─> Уточнения, вопросы, загрузка фото/чертежей

5. Уведомление "Проект готов!"
   └─> Email/push notification

6. Просмотр результатов в Client Portal
   ├─> Графики (интерактивные, те же ECharts!)
   ├─> Финальные рекомендации
   └─> Скачивание отчёта (PDF)

7. Доступ только к СВОЕМУ проекту
   └─> View-only, безопасность
```

**Функции:**
- 🆕 Onboarding (анкета, оплата)
- 🆕 Project Dashboard (My Projects)
- 🆕 Project Viewer (графики, отчёт) ← **переиспользуем компоненты из Engineer App!**
- 🆕 Chat (real-time messaging)
- 🆕 Access control (клиент видит только свой проект)

---

### 🔗 Связь между системами (ФАЗА 2)

**Когда реализуем Client Portal:**

```
Engineer App (Desktop)
├─> Выбрал проект "Vesta_1.6_IM"
├─> [Publish to Client Portal] ← новая кнопка
├─> Выгрузка результатов в Cloud (API)
└─> Email клиенту: "Проект готов! Ссылка: https://..."

Client Portal (Web)
├─> Клиент заходит по ссылке
├─> Видит свой проект (view-only)
└─> Скачивает отчёт, смотрит графики
```

---

## 🏗️ Scalability Strategy (почему эти технологии?)

### Принцип: **Write Once, Use Everywhere**

**Технологический стек выбран так, чтобы переиспользовать код:**

### ✅ React 18 + TypeScript
- **Сейчас:** UI компоненты в Engineer App (Electron)
- **Потом:** Те же компоненты в Client Portal (веб)
- **Переиспользуем:** 80-90% UI кода!

**Примеры компонентов для переиспользования:**
- `<ChartViewer>` - визуализация графиков (ECharts)
- `<ProjectCard>` - карточка проекта
- `<ConfigurationViewer>` - просмотр .prt
- `<DataTable>` - таблица результатов

### ✅ ECharts (графики)
- **Сейчас:** Интерактивные графики в Engineer App
- **Потом:** Те же графики в Client Portal
- **Переиспользуем:** 100% кода графиков!
- **Одинаковый UX** для инженера и клиента

### ✅ Node.js + Express (backend)
- **Сейчас:** Локальный сервер (localhost:3000)
- **Потом:** Cloud API (api.engineviewer.com)
- **Переиспользуем:** Парсеры (.det/.pou/.prt), бизнес-логика

**Примеры API endpoints для переиспользования:**
- `GET /api/projects` - список проектов
- `GET /api/projects/:id/calculations` - данные расчётов
- `POST /api/projects/:id/export-pdf` - генерация PDF

### ✅ TypeScript (типизация)
- **Сейчас:** Типы данных (EngineData, Calculation, Configuration)
- **Потом:** Те же типы в Client Portal
- **Переиспользуем:** 100% типов!

**Пример:**
```typescript
// Определяем типы один раз
interface EngineData {
  rpm: number[];
  power: number[];
  torque: number[];
}

// Используем в Engineer App
const EngineerChartView: React.FC<{data: EngineData}> = ...

// Используем в Client Portal (те же типы!)
const ClientChartView: React.FC<{data: EngineData}> = ...
```

### ⚠️ Что НЕ переиспользуем (специфично для каждого приложения):

**Engineer App (специфика):**
- File system access (C:/4Stroke/)
- Electron API (desktop features)
- Local database (SQLite)

**Client Portal (специфика):**
- Authentication (клиенты)
- Payment processing (Stripe)
- Cloud storage (AWS S3/Firebase)
- Access control (permissions)

### 📊 Оценка переиспользования кода:

- **UI компоненты:** 80-90% переиспользуем
- **Графики:** 100% переиспользуем
- **API endpoints:** 70-80% переиспользуем
- **Типы данных:** 100% переиспользуем
- **Бизнес-логика:** 60-70% переиспользуем

**Итого:** ~70-80% кода Engineer App можно использовать в Client Portal!

---

## 🎯 Контекст проекта

### EngMod4T - существующая система (Pascal, Desktop)

**Состоит из 3 программ:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. DAT4T (сборщик проекта)                              │
│    ├─ Настройка параметров двигателя                    │
│    ├─ Bore, Stroke, Exhaust, Intake, Combustion        │
│    └─ [Accept] → создаёт/обновляет .prt файл           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. EngMod4T (расчётная программа)                       │
│    ├─ Читает .prt (конфигурация)                       │
│    ├─ Запускает термодинамические расчёты               │
│    └─ Создаёт/дополняет .det/.pou (результаты)         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Post4T (старый визуализатор) ❌ ЗАМЕНЯЕМ!           │
│    ├─ Читает .det/.pou                                 │
│    ├─ Устаревший UI                                    │
│    └─ Ограниченная функциональность                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Engine Viewer (новый веб-визуализатор) ✅ СОЗДАЁМ!     │
│    ├─ Современный React UI                             │
│    ├─ Интерактивные графики ECharts                    │
│    ├─ Configuration History (версионирование)          │
│    └─ Premium функции (подписка)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Структура файлов и директорий

### Фактическая структура (подтверждено скриншотами)

```
C:/4Stroke/                              ← Корневая папка EngMod4T
│
├── Vesta_1.6_IM.prt                     ← Конфигурация проекта #1 (в корне!)
├── 4_Cyl_ITB.prt                        ← Конфигурация проекта #2
├── TM_Soft_ShortCut.prt                 ← Конфигурация проекта #3
├── BMW_M3_E46.prt                       ← Конфигурация проекта #4
├── [ещё ~46 проектов в год...]          ← У каждого проекта свой .prt файл!
│                                           READ-ONLY для Engine Viewer
│                                           Перезаписывается при работе над проектом
│
├── Dat4TLicenceCheck.dat                ← Служебные файлы DAT4T
├── Dat4TErrorLog.dat
├── OldprojectFile.fle
│
├── Vesta_1.6_IM/                        ← Папка с результатами проекта #1
│   ├── Vesta_1.6_IM.det                 ← Performance: все расчёты (markers)
│   ├── Vesta_1.6_IM.pou                 ← Performance: все расчёты
│   ├── Vesta_1.6_IM_8500.pde            ← Газодинамика: pressure data
│   ├── Vesta_1.6_IM_8500.pvd            ← Газодинамика: valve data
│   ├── Vesta_1.6_IM_8500.eff            ← Газодинамика: efficiency
│   ├── Vesta_1.6_IM_8500.wmf            ← Газодинамика: wave motion
│   ├── Vesta_1.6_IM_8500.cyl            ← Газодинамика: cylinder data
│   │
│   └── .metadata/                       ← НАША папка (Engine Viewer)
│       ├── project.json                 ← Метаданные проекта
│       └── prt-versions/                ← Версии конфигураций
│           ├── $1.prt                   ← Snapshot при расчёте $1
│           ├── $2.prt                   ← Snapshot при расчёте $2
│           ├── $15.prt                  ← Snapshot при расчёте $15
│           └── index.json               ← Метаданные snapshots
│
├── 4_Cyl_ITB/                           ← Папка с результатами проекта #2
│   ├── 4_Cyl_ITB.det
│   ├── 4_Cyl_ITB.pou
│   ├── 4_Cyl_ITB_8500.pde
│   └── .metadata/
│       └── prt-versions/
│           ├── $baseline.prt
│           ├── $v2.prt
│           └── index.json
│
├── TM_Soft_ShortCut/                    ← Папка с результатами проекта #3
│   └── [аналогично...]
│
└── [остальные ~47 папок проектов...]
```

**Ключевые моменты:**
- ✅ **Каждый проект имеет свой `.prt` файл** в корне C:/4Stroke/
- ✅ **Каждый проект имеет свою папку** с результатами
- ✅ Имена совпадают: `ProjectName.prt` и папка `ProjectName/`
- ⚠️ **Внутри одного проекта** `.prt` перезаписывается при каждом Accept
- 📊 **~50 проектов в год** - типичная нагрузка инженера

### Правила работы с файлами

**🔒 READ-ONLY (только чтение):**
- `C:/4Stroke/ProjectName.prt` - **НЕЛЬЗЯ МОДИФИЦИРОВАТЬ** (сломает EngMod4T)

**⚠️ LIMITED WRITE (ограниченная модификация):**
- `C:/4Stroke/ProjectName/ProjectName.det` - можем менять **только marker names**
- `C:/4Stroke/ProjectName/ProjectName.pou` - можем менять **только marker names**

**✅ FULL ACCESS (полная свобода):**
- `C:/4Stroke/ProjectName/.metadata/` - **наша папка**, делаем что хотим
- `C:/4Stroke/ProjectName/[файлы Post4T]` - можем модифицировать

### Типы данных (scope проекта)

**Performance данные** (текущий scope - ✅ реализовано):
- `.det` - результаты расчётов (RPM, Power, Torque, Pressure, Temperature...)
- `.pou` - результаты расчётов (дополнительные параметры)
- **Engine Viewer уже парсит и визуализирует эти данные!**

**Газодинамика** (будущий scope - ⏳ планируется):
- `.pde` - Pressure data (давление в системе)
- `.pvd` - Valve data (данные клапанов)
- `.eff` - Efficiency data (эффективность)
- `.wmf` - Wave motion data (волновые процессы)
- `.cyl` - Cylinder data (данные по цилиндрам)

**Другие типы визуализаций** (в Post4T):
- Thermo- and Gasdynamic Traces
- Performance and Efficiency Plots ← **текущий фокус**
- PV-Diagrams (диаграммы давление-объём)
- Noise Spectrum Processing
- Turbo-/Supercharger Map Plot

**Стратегия развития:**
1. ✅ **Phase 1 (сейчас):** Performance визуализация (.det/.pou)
2. ⏳ **Phase 2 (потом):** Газодинамика (.pde, .pvd, .eff, .wmf, .cyl)
3. ⏳ **Phase 3 (потом):** PV-диаграммы и специализированные графики

---

## 🔄 Workflow пользователя

### Типичный цикл работы инженера

```
ДЕНЬ 1: Работа над проектом 4_Cyl_ITB

┌──────────────────────────────────────────────────────────┐
│ ШАГ 1: Создание проекта                                  │
├──────────────────────────────────────────────────────────┤
│ DAT4T: Создал новый проект "4_Cyl_ITB"                   │
│ DAT4T: Настроил параметры (bore, stroke, exhaust...)    │
│ DAT4T: [Accept]                                          │
│   └─> Создал C:/4Stroke/4_Cyl_ITB.prt                   │
│   └─> Создал папку C:/4Stroke/4_Cyl_ITB/                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ШАГ 2: Baseline расчёт                                   │
├──────────────────────────────────────────────────────────┤
│ EngMod4T: Запустил расчёт с marker $baseline            │
│   ├─> Прочитал C:/4Stroke/4_Cyl_ITB.prt (конфигурация)  │
│   └─> Создал 4_Cyl_ITB/4_Cyl_ITB.det (результаты)       │
│                                                          │
│ 📊 Конфигурация: header 650mm, timing 14.7° @ 2000 RPM  │
│ 📊 Результаты: P_max 85 HP @ 8000 RPM                   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ШАГ 3: Изменение параметров                             │
├──────────────────────────────────────────────────────────┤
│ DAT4T: Изменил exhaust header: 650mm → 700mm            │
│ DAT4T: [Accept]                                          │
│   └─> ПЕРЕЗАПИСАЛ C:/4Stroke/4_Cyl_ITB.prt ❌           │
│                                                          │
│ ⚠️ ПРОБЛЕМА: Baseline конфигурация ПОТЕРЯНА!            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ШАГ 4: Новый расчёт                                     │
├──────────────────────────────────────────────────────────┤
│ EngMod4T: Запустил расчёт с marker $v2_longer_header   │
│   ├─> Прочитал C:/4Stroke/4_Cyl_ITB.prt (v2 конфигурация)│
│   └─> Дополнил 4_Cyl_ITB/4_Cyl_ITB.det (результаты)     │
│                                                          │
│ 📊 Конфигурация: header 700mm, timing 14.7° @ 2000 RPM  │
│ 📊 Результаты: P_max 90 HP @ 8000 RPM (+5 HP!)          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ШАГ 5: Анализ результатов                               │
├──────────────────────────────────────────────────────────┤
│ Инженер: Открыл Engine Viewer                           │
│ Инженер: Выбрал $baseline и $v2 на графиках            │
│ Инженер: Видит разницу: +5 HP 🎉                        │
│                                                          │
│ ❌ ПРОБЛЕМА: Не понимает, ЧТО изменилось!               │
│    - Может быть header?                                 │
│    - Может быть timing?                                 │
│    - Может быть AFR?                                    │
│    - Не знает! Нужна Excel таблица... 😞                │
└──────────────────────────────────────────────────────────┘
```

### Проблема потери конфигураций

**Текущая ситуация:**
- Каждый проект имеет свой `.prt` файл: `ProjectName.prt`
- **Внутри проекта** `.prt` перезаписывается при каждом Accept в DAT4T
- При нескольких расчётах в одном проекте → исторические конфигурации **теряются**
- Инженер делает ~50 проектов в год, в каждом проекте ~10-50 расчётов

**Последствия:**
- ❌ Невозможно понять, что изменилось между расчётами **внутри проекта**
- ❌ Невозможно "откатиться" к успешной конфигурации
- ⏰ Инженер ведёт ручные Excel таблицы (трата времени)
- ❌ Неполная документация (легко забыть записать)
- 🔍 Сложно найти причинно-следственные связи (изменил header +5HP, но что ещё менялось?)

---

## 💡 Решение: Автоматическое версионирование конфигураций

### Концепция

**Идея:** Автоматически сохранять snapshot `.prt` файла для каждого calculation marker

**Механизм:**
1. Пользователь делает расчёт → появляется новый marker в `.det`
2. Engine Viewer обнаруживает новый marker
3. Engine Viewer копирует текущий `.prt` → сохраняет как `.metadata/prt-versions/$marker.prt`
4. Snapshot сохранён! ✅

### Архитектура хранения

```
C:/4Stroke/4_Cyl_ITB/
└── .metadata/
    └── prt-versions/
        ├── $baseline.prt                ← Snapshot конфигурации для $baseline
        ├── $v2_longer_header.prt        ← Snapshot конфигурации для $v2
        ├── $v15_final.prt               ← Snapshot конфигурации для $v15
        └── index.json                   ← Метаданные
```

### Формат index.json

```json
{
  "$baseline": {
    "createdAt": "2025-11-04T10:30:00Z",
    "capturedFrom": "C:/4Stroke/4_Cyl_ITB.prt",
    "fileSize": 12456,
    "checksum": "sha256:abc123..."
  },
  "$v2_longer_header": {
    "createdAt": "2025-11-04T14:15:00Z",
    "capturedFrom": "C:/4Stroke/4_Cyl_ITB.prt",
    "fileSize": 12460,
    "checksum": "sha256:def456...",
    "changesFrom": "$baseline",
    "changesCount": 3
  }
}
```

### Backend алгоритм

```javascript
// Engine Viewer при открытии проекта
function versionPrtFile(projectName) {
  // Пути файлов
  const prtFile = `C:/4Stroke/${projectName}.prt`;           // в корне!
  const detFile = `C:/4Stroke/${projectName}/${projectName}.det`;
  const versionsDir = `C:/4Stroke/${projectName}/.metadata/prt-versions/`;
  
  // 1. Парсим .det - получаем все markers
  const calculations = parseDetFile(detFile);
  const markers = calculations.map(c => c.id); // ["$baseline", "$v2", ...]
  
  // 2. Убеждаемся что директория существует
  ensureDirectoryExists(versionsDir);
  
  // 3. Загружаем index.json
  const index = loadIndex(versionsDir) || {};
  
  // 4. Для каждого marker проверяем snapshot
  for (const marker of markers) {
    const snapshotPath = `${versionsDir}/${marker}.prt`;
    
    if (!fileExists(snapshotPath)) {
      // Новый marker - сохраняем snapshot!
      copyFile(prtFile, snapshotPath);
      
      // Обновляем index
      index[marker] = {
        createdAt: new Date().toISOString(),
        capturedFrom: prtFile,
        fileSize: getFileSize(prtFile),
        checksum: calculateChecksum(prtFile)
      };
      
      console.log(`✅ Saved snapshot: ${marker}.prt`);
    }
  }
  
  // 5. Сохраняем обновлённый index
  saveIndex(versionsDir, index);
}
```

---

## ⚠️ Критичная проблема: Timing

### Проблема race condition

```
Время T1: DAT4T Accept → создал 4_Cyl_ITB.prt (baseline конфигурация)
Время T2: EngMod4T расчёт → создал marker $baseline в .det
Время T3: DAT4T Accept → ПЕРЕЗАПИСАЛ 4_Cyl_ITB.prt (v2 конфигурация) ❌
Время T4: Engine Viewer открыли → видим $baseline в .det
Время T5: Engine Viewer копирует 4_Cyl_ITB.prt → но это уже v2! ❌

Результат: Snapshot для $baseline содержит v2 конфигурацию!
```

### Решение: Manual workflow (MVP)

**Рекомендуемый workflow для пользователя:**

```
1. DAT4T: настроили параметры → [Accept]
2. EngMod4T: запустили расчёт → появился marker в .det
3. ✅ СРАЗУ открыть Engine Viewer → нажать "Save Snapshot"
4. Engine Viewer скопирует текущий .prt для этого marker
5. Повторить цикл для следующего расчёта
```

**UI в Engine Viewer:**

```
┌────────────────────────────────────────┐
│ 🔔 New calculation detected!           │
│                                        │
│ Marker: $v2_longer_header             │
│ ⚠️  No configuration snapshot saved    │
│                                        │
│ Current .prt will be overwritten on   │
│ next DAT4T Accept!                    │
│                                        │
│ [Save Snapshot Now] [Skip]            │
└────────────────────────────────────────┘
```

### Будущее улучшение: Auto-snapshot (Premium)

**Для Premium подписки:**

```
Engine Viewer работает как background service
├─> Следит за изменениями .det файлов (file watcher)
├─> Обнаружил новый marker → немедленно копирует .prt
└─> Показывает notification "Snapshot saved for $v2"
```

**Технические требования:**
- Windows Service или daemon процесс
- File system watching (chokidar или аналог)
- Notification system (toast notifications)

---

## 📄 Финальный отчёт для клиента

### Назначение отчёта

Клиент заплатил за проект и должен получить **полную техническую документацию** для реализации оптимальной конфигурации двигателя.

### Требования к отчёту:

**Критичная информация (must have):**
- ✅ **Полные размеры системы выпуска** (длины, диаметры всех труб, collector)
- ✅ **Полные размеры системы впуска** (ITB/IM, длины, диаметры всех pipes)
- ✅ **Чертежи/схемы** (визуализация конфигурации)
- ✅ **Графики результатов** (Power, Torque, Efficiency, Pressure, Temperature)
- ✅ **Рекомендации по реализации** (материалы, допуски, настройка)

**Качество:**
- ✅ Профессиональный вид (брендинг)
- ✅ Понятная структура
- ✅ Готов к печати (PDF, A4)
- ✅ Все размеры с единицами измерения

### Структура отчёта (PDF):

```
┌─────────────────────────────────────────────────────────┐
│ ТИТУЛЬНАЯ СТРАНИЦА                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Engine Optimization Report                              │
│                                                          │
│ Project: Vesta 1.6 Turbo                                │
│ Client: Ivan Petrov                                     │
│ Date: 04.11.2025                                        │
│ Engineer: Vladimir [Surname]                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 1. ИСХОДНЫЕ ДАННЫЕ                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 1.1 Требования клиента                                  │
│     • Целевая мощность: 150 HP                          │
│     • Целевой крутящий момент: 160 Nm                   │
│     • Рабочий диапазон: 2000-8000 RPM                   │
│     • Бюджет: [X] руб                                   │
│                                                          │
│ 1.2 Базовая конфигурация двигателя                      │
│     • Type: 4-cylinder Inline, Naturally Aspirated     │
│     • Bore × Stroke: 82.5 × 75.6 mm                    │
│     • Displacement: 1616 cc                             │
│     • Compression Ratio: 11.3:1                         │
│     • Cylinder Head: Tumble Flow, 4 valves/cylinder    │
│                                                          │
│ 1.3 Используемые компоненты                             │
│     • Распредвал: [профиль, модель]                    │
│     • Поршни: [модель, CR]                             │
│     • Шатуны: [модель, длина]                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. ОПТИМАЛЬНАЯ КОНФИГУРАЦИЯ                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 2.1 Exhaust System (Система выпуска)                    │
│                                                          │
│     Конфигурация: 4-into-2-into-1 collector             │
│                                                          │
│     Header Pipes (4 шт):                                │
│     • Length: 650 mm                                    │
│     • Diameter: Ø 35.0 mm                               │
│     • Material: Нержавеющая сталь 304                   │
│                                                          │
│     Connector Pipes (2 шт):                             │
│     • Length: 411 mm                                    │
│     • Diameter: Ø 45.3 mm                               │
│                                                          │
│     Collector Pipe:                                     │
│     • Length: 630 mm                                    │
│     • Diameter: Ø 57.0 mm                               │
│                                                          │
│     Exhaust Box:                                        │
│     • Volume: 12,000 cc                                 │
│                                                          │
│     [ЧЕРТЁЖ: Схема выпускного коллектора]               │
│                                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 2.2 Intake System (Система впуска)                      │
│                                                          │
│     Конфигурация: Individual Throttle Bodies (ITB)      │
│                                                          │
│     Cylinder Pipes (4 шт):                              │
│     • Section 1: 37.5 mm × Ø 43.0 mm                   │
│     • Section 2: 145.0 mm × Ø 43.0→36.0 mm (taper)     │
│                                                          │
│     Throttle Body Pipes (4 шт):                         │
│     • Total length: 127.5 mm                            │
│     • Multi-section taper (см. таблицу)                │
│                                                          │
│     Throttle Bodies:                                    │
│     • Type: Butterfly                                   │
│     • Spindle diameter: 5.0 mm                          │
│     • Edge: Bell mouth (inlet)                          │
│                                                          │
│     [ЧЕРТЁЖ: Схема системы впуска]                      │
│     [ТАБЛИЦА: Детальные размеры по секциям]             │
│                                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 2.3 Combustion Settings (Настройки сгорания)            │
│                                                          │
│     Fuel Type: 100 Unleaded (октановое число 100)       │
│                                                          │
│     Ignition Timing Curve:                              │
│     ┌─────────┬───────────┐                            │
│     │ RPM     │ Timing    │                            │
│     ├─────────┼───────────┤                            │
│     │ 2000    │ 14.7°     │                            │
│     │ 3000    │ 17.6°     │                            │
│     │ 4000    │ 19.6°     │                            │
│     │ 5000    │ 21.5°     │                            │
│     │ 6000    │ 23.5°     │                            │
│     │ 7000    │ 25.5°     │                            │
│     │ 8000    │ 27.5°     │                            │
│     │ 9000    │ 29.4°     │                            │
│     └─────────┴───────────┘                            │
│                                                          │
│     Air-Fuel Ratio (AFR) Curve:                         │
│     ┌─────────┬───────────┐                            │
│     │ RPM     │ AFR       │                            │
│     ├─────────┼───────────┤                            │
│     │ 2000    │ 12.57     │                            │
│     │ 4000    │ 12.52     │                            │
│     │ 6000    │ 12.50     │                            │
│     │ 8000    │ 12.45     │                            │
│     │ 9000    │ 12.42     │                            │
│     └─────────┴───────────┘                            │
│                                                          │
│     Valve Timing:                                       │
│     • Exhaust Dwell Center: 104.0° BTDC                │
│     • Inlet Dwell Center: 102.0° ATDC                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3. РЕЗУЛЬТАТЫ РАСЧЁТОВ                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 3.1 Power Curve (Мощность)                             │
│                                                          │
│     [ГРАФИК: Power vs RPM]                              │
│                                                          │
│     Key Results:                                        │
│     • Maximum Power: 152 HP @ 8000 RPM ✅               │
│     • Power @ 6000 RPM: 140 HP                          │
│     • Power @ 4000 RPM: 95 HP                           │
│                                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 3.2 Torque Curve (Крутящий момент)                     │
│                                                          │
│     [ГРАФИК: Torque vs RPM]                             │
│                                                          │
│     Key Results:                                        │
│     • Maximum Torque: 165 Nm @ 6500 RPM ✅              │
│     • Torque @ 4000 RPM: 150 Nm                         │
│     • Torque @ 2000 RPM: 110 Nm                         │
│                                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 3.3 Volumetric Efficiency                              │
│                                                          │
│     [ГРАФИК: VE vs RPM]                                 │
│                                                          │
│     • Peak VE: 98% @ 7500 RPM                          │
│     • Average VE (4000-8000): 92%                       │
│                                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 3.4 Temperatures and Pressures                         │
│                                                          │
│     [ГРАФИК: Cylinder Max Pressure vs RPM]              │
│     [ГРАФИК: Exhaust Temperature vs RPM]                │
│                                                          │
│     • Max Cylinder Pressure: 85 bar @ 6000 RPM         │
│     • Max Exhaust Temperature: 820°C @ 8000 RPM        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 4. РЕКОМЕНДАЦИИ ПО РЕАЛИЗАЦИИ                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ 4.1 Критичные размеры                                   │
│                                                          │
│     Exhaust System:                                     │
│     • Длины header pipes: ±5 mm допуск                 │
│     • Диаметры труб: ±0.5 mm допуск                    │
│     • Качество сварки: TIG, полный провар              │
│                                                          │
│     Intake System:                                      │
│     • Длины cylinder pipes: ±3 mm допуск               │
│     • Taper sections: строго по чертежу                │
│     • Bell mouth inlet: R = 5 mm радиус                │
│                                                          │
│ 4.2 Материалы                                           │
│                                                          │
│     • Exhaust: Нержавеющая сталь 304 (1.5 mm толщина)  │
│     • Intake: Алюминий 6061-T6 или сталь               │
│     • Прокладки: Multi-layer steel (MLS)               │
│                                                          │
│ 4.3 Настройка ECU                                       │
│                                                          │
│     • Используйте Ignition Timing Curve из раздела 2.3 │
│     • Используйте AFR Curve из раздела 2.3             │
│     • Lambda sensor: Wideband (Bosch LSU 4.9)          │
│     • Настройка на динамометре (обязательно!)          │
│                                                          │
│ 4.4 Проверка после установки                            │
│                                                          │
│     • Проверка на утечки (exhaust system)              │
│     • Синхронизация дроссельных заслонок (ITB)         │
│     • Настройка AFR под нагрузкой                      │
│     • Контроль детонации (knock sensor)                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 5. ПРИЛОЖЕНИЯ                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ Приложение A: Таблицы данных (полные результаты)        │
│ Приложение B: Flowbench data (intake/exhaust ports)    │
│ Приложение C: Valve lift profiles (cam specifications) │
│                                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ Контакты для поддержки:                                 │
│ Email: engineer@example.com                             │
│ Phone: +7 XXX XXX-XX-XX                                 │
│                                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                          │
│ © 2025 Engine Optimization Services                     │
│ Все права защищены                                      │
└─────────────────────────────────────────────────────────┘
```

### Технические требования к генерации PDF:

**Библиотеки:**
- **puppeteer** (рендеринг HTML → PDF, high quality)
- **pdfkit** (альтернатива, lower-level control)
- **chart.js** или **ECharts** для графиков в PDF

**Качество:**
- Resolution: 300 DPI (печать)
- Page size: A4 (210 × 297 mm)
- Margins: 20mm со всех сторон
- Fonts: Embedded (для кириллицы)

**Брендинг:**
- Logo инженера (header)
- Цветовая схема (профессиональная)
- Footer с контактами

---

## 🏗️ System Architecture

### Компоненты системы (Engineer App - ФАЗА 1)

```
┌───────────────────────────────────────────────────────────┐
│ User Interface Layer (React 18 + TypeScript)              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ├─ Projects Dashboard (список проектов)                  │
│ ├─ Project Page (графики, charts)                        │
│ ├─ Configuration History (версионирование .prt)          │
│ ├─ Configuration Viewer (просмотр .prt)                  │
│ ├─ Configuration Diff (сравнение конфигураций)           │
│ ├─ Project Info (метаданные клиента, требования)         │
│ └─ Report Generator UI (настройка экспорта PDF)          │
└───────────────────────────────────────────────────────────┘
                         ↕ HTTP/REST API (localhost)
┌───────────────────────────────────────────────────────────┐
│ Backend Layer (Node.js 18 + Express)                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ├─ Project Scanner (сканирует C:/4Stroke/)               │
│ ├─ File Parsers (.det, .pou, .prt)                       │
│ ├─ Versioning Service (управление .prt snapshots)        │
│ ├─ Report Generator (PDF export, puppeteer)              │
│ ├─ Project Metadata Manager (client info, requirements)  │
│ └─ Local Database (SQLite - кэш, настройки)              │
└───────────────────────────────────────────────────────────┘
                         ↕ File System Access
┌───────────────────────────────────────────────────────────┐
│ Data Layer (File System)                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ├─ C:/4Stroke/ProjectName.prt (READ-ONLY)                │
│ ├─ C:/4Stroke/ProjectName/*.det/.pou (READ + LIMITED)    │
│ └─ C:/4Stroke/ProjectName/.metadata/ (FULL ACCESS)       │
│     ├─ project.json (client info, requirements, notes)   │
│     └─ prt-versions/ (configuration snapshots)           │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ Electron Wrapper (Desktop App)                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ├─ Window management                                     │
│ ├─ System tray icon                                      │
│ ├─ Auto-start (optional)                                 │
│ ├─ File dialogs (open/save)                             │
│ └─ Native notifications                                  │
└───────────────────────────────────────────────────────────┘
```

### Deployment модель (ФАЗА 1 - Engineer App)

**Технологии:**
- **Electron** - desktop wrapper (или просто Node.js + браузер)
- **Node.js 18** - embedded (portable)
- **Express** - локальный сервер (localhost:3000)
- **React 18** - frontend (static files)

**Упаковка:**
- **electron-builder** - создание .exe для Windows
- **Portable mode** - без установки, распаковал и запустил
- **Auto-update** - проверка обновлений (опционально)

**Размер приложения:**
- ~80-120 MB (с embedded Node.js)
- Портативная версия (ZIP) или installer (InnoSetup)

**Работа offline:**
- ✅ Полная функциональность без интернета
- ✅ Все данные локально (C:/4Stroke/)
- ✅ Безопасность (данные не уходят в облако)

### API Endpoints (Engineer App - localhost:3000)

**Projects:**
```
GET /api/projects
    → Список всех проектов в C:/4Stroke/

GET /api/projects/:projectName
    → Детали проекта (метаданные, список расчётов)

PUT /api/projects/:projectName/metadata
    → Обновить метаданные проекта (client info, requirements)

GET /api/projects/:projectName/calculations
    → Список всех calculation markers

GET /api/projects/:projectName/calculations/:marker
    → Данные конкретного расчёта
```

**Configuration Versioning:**
```
GET /api/projects/:projectName/prt-versions
    → Список всех сохранённых .prt версий

GET /api/projects/:projectName/prt-versions/:marker
    → Конкретная версия .prt (parsed)

POST /api/projects/:projectName/prt-versions/:marker/save
    → Сохранить текущий .prt как snapshot для marker

GET /api/projects/:projectName/prt-versions/compare/:marker1/:marker2
    → Diff между двумя конфигурациями

DELETE /api/projects/:projectName/prt-versions/:marker
    → Удалить snapshot (с подтверждением)
```

**Report Generation:**
```
POST /api/projects/:projectName/export/pdf
    → Генерация финального отчёта для клиента (PDF)
    Body: {
      markers: ["$baseline", "$v2"],  // какие расчёты включить
      includeCharts: true,
      includeConfiguration: true,
      includeTables: true,
      clientInfo: { name, email, ... }
    }
    Response: { pdfUrl: "/outputs/Vesta_1.6_IM_Report.pdf" }

GET /api/projects/:projectName/export/excel
    → Экспорт данных в Excel
```

**File Operations:**
```
GET /api/files/browse?path=C:/4Stroke/
    → File browser (для выбора папки проектов)

POST /api/files/scan
    → Пересканировать C:/4Stroke/ (поиск новых проектов)
```

---

## 🎨 UI/UX Design

### Project Discovery

**Главная страница (Projects Dashboard):**

```
┌─────────────────────────────────────────────────────────┐
│ Engine Viewer                        [Settings] [Profile]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📂 C:/4Stroke/                    [Change Folder] [Scan]│
│                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ 4_Cyl_ITB    │ │ Vesta_1.6_IM │ │ TM_Soft      │     │
│ │              │ │              │ │              │     │
│ │ 15 расчётов  │ │ 42 расчёта   │ │ 8 расчётов   │     │
│ │ Updated: 2ч  │ │ Updated: 5д  │ │ Updated: 1мес│     │
│ │              │ │              │ │              │     │
│ │ [Open]       │ │ [Open]       │ │ [Open]       │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Автоматическое сканирование:**
- При запуске → сканирует `C:/4Stroke/`
- Находит все папки с `.det` файлами
- Проверяет наличие соответствующего `.prt` в корне
- Показывает карточки проектов

### Configuration History (новая вкладка)

**Расположение:** ProjectPage, рядом с Charts и Data Table

```
┌─────────────────────────────────────────────────────────┐
│ 4_Cyl_ITB                                               │
│ [Charts] [Data Table] [Configuration History] ← НОВОЕ! │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Configuration History                                   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📋 $baseline                                       │  │
│ │ Baseline configuration                             │  │
│ │ Saved: 4 Nov 2025, 10:30                          │  │
│ │                                                    │  │
│ │ [View Config] [Compare with Current]              │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📋 $v2_longer_header                  🔔 UNSAVED   │  │
│ │ ⚠️  No snapshot saved!                             │  │
│ │ Detected: 4 Nov 2025, 14:15                       │  │
│ │                                                    │  │
│ │ [Save Snapshot Now] [View Results]                │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Configuration Viewer (modal)

```
┌─────────────────────────────────────────────────────┐
│ Configuration: $baseline                      [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔧 ENGINE                                           │
│ • Type: 4-cylinder Inline, Naturally Aspirated    │
│ • Bore × Stroke: 82.5 × 75.6 mm                   │
│ • Displacement: 1616 cc                            │
│ • Compression Ratio: 11.3:1                        │
│                                                     │
│ 🌪️  INTAKE SYSTEM                                   │
│ • Type: Individual Throttle Bodies (ITB)          │
│ • Throttles: 4 × Butterfly type                   │
│ • Pipes: 8 total (4 cylinder + 4 throttle)        │
│                                                     │
│ 🔥 EXHAUST SYSTEM                                   │
│ • Type: 4-into-2-into-1 collector                 │
│ • Header pipes: 4 × 650mm, Ø 35mm                 │
│ • Connector pipes: 2 × 411mm, Ø 45.3mm            │
│ • Collector: 630mm, Ø 57mm                        │
│ • Exhaust box: 12000 cc                           │
│                                                     │
│ ⚡ COMBUSTION                                        │
│ • Fuel: 100 Unleaded                              │
│ • Timing: 14.7° @ 2000 RPM → 29.4° @ 9000 RPM     │
│ • AFR: 12.57 @ 2000 RPM → 12.42 @ 9000 RPM        │
│                                                     │
│ [Export PDF] [Copy to Clipboard] [Compare]        │
└─────────────────────────────────────────────────────┘
```

### Configuration Diff (modal)

```
┌─────────────────────────────────────────────────────┐
│ Compare: $v2_longer_header vs $baseline      [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔥 EXHAUST SYSTEM                                   │
│ ● Header length: 500mm → 650mm          (+150mm)   │
│ ● Connector length: 411mm (unchanged)              │
│ ● Collector diameter: 57mm (unchanged)             │
│                                                     │
│ ⚡ COMBUSTION                                        │
│ ● Timing @ 6000 RPM: 23.5° → 25.0°       (+1.5°)   │
│ ○ Timing @ 2000 RPM: 14.7° (unchanged)             │
│ ○ AFR: 12.5 (unchanged)                            │
│                                                     │
│ 🔧 ENGINE (unchanged)                               │
│ ○ Bore, stroke, CR, cylinders                      │
│                                                     │
│ 🌪️  INTAKE SYSTEM (unchanged)                       │
│ ○ ITB configuration                                │
│                                                     │
│ Legend: ● Changed  ○ Unchanged                     │
│                                                     │
│ [Export Diff Report] [Apply to Current]           │
└─────────────────────────────────────────────────────┘
```

---

### Project Info (метаданные клиента)

**Расположение:** ProjectPage, кнопка [Project Info] в header

```
┌─────────────────────────────────────────────────────┐
│ Project Information: Vesta_1.6_IM            [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 👤 CLIENT INFORMATION                               │
│                                                     │
│ Name:     [Ivan Petrov                        ]    │
│ Email:    [ivan@example.com                   ]    │
│ Phone:    [+7 XXX XXX-XX-XX                   ]    │
│                                                     │
│ 📋 PROJECT DETAILS                                  │
│                                                     │
│ Order Date:   [01.11.2025]                         │
│ Status:       [○ В работе  ● Готов  ○ Опубликован]│
│                                                     │
│ 🎯 REQUIREMENTS                                     │
│                                                     │
│ Target Power:    [150 HP              ]            │
│ Target Torque:   [160 Nm              ]            │
│ RPM Range:       [2000 - 8000         ]            │
│ Budget:          [100,000 руб         ]            │
│                                                     │
│ Additional Requirements:                            │
│ ┌───────────────────────────────────────────────┐  │
│ │ Хочу систему ITB для лучшего отклика дросселя│  │
│ │ Бюджет ограничен, предпочтительно стандартные│  │
│ │ компоненты                                    │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ 📝 NOTES (для инженера)                             │
│ ┌───────────────────────────────────────────────┐  │
│ │ - Сделал продувку ГБЦ 04.11.2025              │  │
│ │ - Измерил распредвал на станке                │  │
│ │ - Клиент хочет отчёт до 15.11.2025            │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ [Save] [Cancel]                                    │
└─────────────────────────────────────────────────────┘
```

---

### Report Generator (генерация PDF)

**Расположение:** ProjectPage, кнопка [Generate Report] в header

```
┌─────────────────────────────────────────────────────┐
│ Generate Final Report                         [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 CALCULATIONS TO INCLUDE                          │
│                                                     │
│ Select calculations:                                │
│ ☑ $baseline      (baseline configuration)          │
│ ☑ $v2            (longer header)                   │
│ ☐ $v3            (test variant)                    │
│ ☑ $v15_final     (optimal configuration) ⭐        │
│                                                     │
│ Highlight as optimal: [▼ $v15_final]               │
│                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                     │
│ 📄 REPORT CONTENT                                   │
│                                                     │
│ ☑ Title Page (client name, project name, date)    │
│ ☑ Initial Data (requirements, base configuration) │
│ ☑ Optimal Configuration (full specs)              │
│   ☑ Exhaust System (dimensions, drawings)         │
│   ☑ Intake System (dimensions, drawings)          │
│   ☑ Combustion Settings (timing, AFR curves)      │
│ ☑ Results (charts)                                 │
│   ☑ Power Curve                                    │
│   ☑ Torque Curve                                   │
│   ☑ Volumetric Efficiency                          │
│   ☑ Temperatures & Pressures                       │
│ ☑ Implementation Recommendations                   │
│ ☑ Appendices (data tables, flowbench data)        │
│                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                     │
│ 🎨 BRANDING                                         │
│                                                     │
│ Company Logo:  [Upload Image...] [Preview]        │
│ Footer Text:   [© 2025 Engine Optimization    ]   │
│ Color Theme:   [▼ Professional Blue]               │
│                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                     │
│ 📁 OUTPUT                                           │
│                                                     │
│ Filename:      [Vesta_1.6_IM_Report_2025-11-04.pdf]│
│ Save to:       [C:/4Stroke/Reports/           📁] │
│                                                     │
│ [Preview] [Generate PDF]                           │
│                                                     │
│ ⏱ Generation time: ~10-30 seconds                  │
└─────────────────────────────────────────────────────┘
```

**После генерации:**

```
┌─────────────────────────────────────────────────────┐
│ ✅ Report Generated Successfully!                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📄 Vesta_1.6_IM_Report_2025-11-04.pdf              │
│                                                     │
│ Size: 8.5 MB                                       │
│ Pages: 18                                          │
│                                                     │
│ [Open PDF] [Open Folder] [Send Email]             │
└─────────────────────────────────────────────────────┘
```

---

## 💰 Бизнес-модель (обновлённая)

### ФАЗА 1 - Engineer App (desktop, сейчас)

**Для инженера (Vladimir):**
- **Модель:** Единовременная покупка или бесплатно (self-use)
- **Все функции доступны:**
  - ✅ Визуализация графиков
  - ✅ Configuration History
  - ✅ Configuration Diff
  - ✅ Report Generator (PDF)
  - ✅ Project metadata management

**Монетизация (опционально):**
- Продажа Engineer App другим инженерам ($XXX единовременно)
- Или subscription ($X/месяц) для updates + support

---

### ФАЗА 2 - Client Portal (web, будущее)

**Для клиентов (заказчики):**
- **Модель:** Оплата за проект (one-time payment)
- **Стоимость:** $XXX-$XXXX за проект (зависит от сложности)
- **Включено:**
  - ✅ Заполнение анкеты (требования)
  - ✅ Чат с инженером (уточнения)
  - ✅ Доступ к результатам (view-only)
  - ✅ Скачивание финального отчёта (PDF)

**Revenue streams:**
1. **Основной доход:** Проекты от клиентов ($XXX × N проектов/месяц)
2. **Дополнительный доход:** Продажа Engineer App другим инженерам

---

## 🚀 Feature Roadmap (обновлённый)

### ФАЗА 1: Engineer App (Desktop) - ТЕКУЩИЙ ФОКУС

**Цель:** Создать полнофункциональный desktop инструмент для работы инженера с клиентами

#### Stage 1: MVP - Core Functionality (3-4 недели)

**Backend (8-10 часов):**
- [ ] Project Scanner (сканирование C:/4Stroke/)
- [ ] File Parsers (.det, .pou) - уже есть базово
- [ ] .prt Parser (полный парсинг конфигурации)
- [ ] Versioning Service (управление .prt snapshots)
- [ ] API endpoints (projects, calculations, prt-versions)

**Frontend (10-12 часов):**
- [ ] Projects Dashboard (главная страница)
  - Карточки проектов
  - Фильтры, сортировка
  - Поиск
- [ ] Project Page (расширение существующего)
  - Вкладка Charts (уже есть!)
  - Вкладка Data Table (уже есть!)
  - Вкладка Configuration History (новая)

**Результат:** Базовое приложение с визуализацией и версионированием

---

#### Stage 2: Configuration Management (2-3 недели)

**Backend (5-7 часов):**
- [ ] Configuration Diff алгоритм
- [ ] Project metadata management (client info, requirements)
- [ ] Local database (SQLite для кэша)

**Frontend (8-10 часов):**
- [ ] Configuration Viewer (modal)
  - Структурированный просмотр .prt
  - По секциям (Engine, Intake, Exhaust, Combustion)
- [ ] Configuration Diff (modal)
  - Side-by-side сравнение
  - Подсветка изменений
- [ ] Project Info (modal)
  - Client information
  - Requirements
  - Notes

**Результат:** Полное управление конфигурациями и метаданными

---

#### Stage 3: Report Generator (2-3 недели)

**Backend (8-10 часов):**
- [ ] PDF generation (puppeteer)
- [ ] Template system (HTML → PDF)
- [ ] Chart rendering в PDF (ECharts → image)
- [ ] Excel export (xlsx)

**Frontend (4-5 часов):**
- [ ] Report Generator UI (modal)
  - Выбор расчётов
  - Настройка содержимого
  - Брендинг (logo, colors)
- [ ] Report Preview (перед генерацией)

**Результат:** Генерация профессиональных отчётов для клиентов

---

#### Stage 4: Polish & Deployment (2-3 недели)

**Функции (6-8 часов):**
- [ ] Settings (preferences, paths, брендинг)
- [ ] Auto-snapshot (background service, опционально)
- [ ] Keyboard shortcuts
- [ ] Error handling & notifications
- [ ] User onboarding (first-time setup)

**Deployment (8-10 часов):**
- [ ] Electron packaging (electron-builder)
- [ ] Windows installer (InnoSetup)
- [ ] Portable version (ZIP)
- [ ] Testing на Windows 10/11
- [ ] Documentation (user guide)

**Результат:** Готовое приложение для использования

**ИТОГО ФАЗА 1:** ~10-13 недель (2.5-3 месяца)

---

### ФАЗА 2: Client Portal (Web SaaS) - БУДУЩЕЕ

**После завершения Engineer App, когда будем готовы масштабироваться:**

#### Stage 1: Backend Infrastructure (4-5 недель)
- [ ] Cloud hosting (AWS/DigitalOcean/Vercel)
- [ ] Database (PostgreSQL)
- [ ] Authentication (клиенты)
- [ ] File storage (S3/Firebase)
- [ ] API для Engineer App (publish projects)

#### Stage 2: Client Portal Frontend (4-5 недель)
- [ ] Onboarding (регистрация, анкета)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Project Dashboard (My Projects)
- [ ] Project Viewer ← **переиспользуем компоненты из Engineer App!**
- [ ] Chat (real-time messaging)

#### Stage 3: Integration (3-4 недели)
- [ ] Engineer App → Client Portal sync
- [ ] Publish workflow
- [ ] Access control (permissions)
- [ ] Notifications (email, push)

**ИТОГО ФАЗА 2:** ~11-14 недель (2.5-3.5 месяца)

---

## 🚀 Deployment Model

### Выбранная модель: Electron + Node.js (Desktop App)

```
EngineViewer.exe (Windows)
├─ Embedded Node.js 18 (backend)
├─ Express server → localhost:3000
├─ React app (frontend, static files)
├─ Auto-открывает браузер при запуске
└─ System tray icon (minimize to tray)
```

**Плюсы:**
- ✅ Простой deployment (один .exe файл, portable)
- ✅ Работает без интернета (offline-first)
- ✅ Данные локально (безопасность, GDPR compliance)
- ✅ Современный UI (веб-технологии)
- ✅ Можно обновлять через auto-update
- ✅ Низкий порог входа (просто запустить .exe)

**Минусы:**
- ⚠️ Требует установку (или portable, без установки)
- ⚠️ Один компьютер (нет синхронизации между устройствами)
- ⚠️ Размер .exe файла (~50-80 MB с embedded Node.js)

### Технический stack для deployment

**Упаковка:**
- **pkg** или **nexe** - упаковка Node.js приложения в .exe
- **electron-builder** (альтернатива, если нужен desktop wrapper)

**Auto-update:**
- **electron-updater** (если используем Electron)
- Или собственный механизм (проверка версии через API)

**Installer:**
- **Inno Setup** - создание Windows installer
- Portable версия - ZIP архив (распаковать и запустить)

---

## 🎯 Приоритеты для текущего этапа

### Immediate Next Steps

**1. Финализировать архитектуру** ✅
   - Документ создан
   - Все решения зафиксированы

**2. Дизайн главной страницы (Projects Dashboard)**
   - Макеты карточек проектов
   - Что показывать в карточке?
   - Фильтры, сортировка
   - Прототипирование на test-data

**3. Создание roadmap для Claude Code**
   - Детальное техническое задание
   - Backend tasks (step-by-step)
   - Frontend tasks (step-by-step)
   - Приоритизация tasks

---

## 📝 Open Questions (для будущих обсуждений)

### ✅ RESOLVED: Основные архитектурные решения

**Структура проектов:**
- ✅ Каждый проект имеет свой `.prt` файл в корне C:/4Stroke/
- ✅ ~50 проектов в год, ~10-50 расчётов на проект
- ✅ Performance данные (.det/.pou) - текущий scope
- ✅ Газодинамика (.pde, .pvd...) - будущий scope

**Две системы:**
- ✅ Engineer App (desktop, ФАЗА 1) - ТЕКУЩИЙ ФОКУС
- ✅ Client Portal (web, ФАЗА 2) - будущее

**Scalability:**
- ✅ React + TypeScript + ECharts - переиспользуем в обеих системах
- ✅ ~70-80% кода можно переиспользовать

---

### ⏳ OPEN: Детали реализации (для следующих сессий)

### 1. Projects Dashboard (главная страница)
- [ ] Что показывать в карточке проекта?
  - Название, количество расчётов, дата
  - Превью графика? (mini chart)
  - Статус проекта? (в работе/готов)
  - Информация о клиенте?
- [ ] Сортировка по умолчанию? (дата/имя/кол-во расчётов)
- [ ] Нужны ли фильтры? (поиск, по дате, по типу двигателя)

### 2. Report Template (финальный отчёт)
- [ ] Финализировать структуру отчёта (секции, порядок)
- [ ] Брендинг (logo, цвета, footer)
- [ ] Язык отчёта (русский/английский/оба)
- [ ] Дополнительные секции? (гарантии, support info)

### 3. Project Metadata (информация о клиенте)
- [ ] Минимальная анкета vs расширенная?
- [ ] Обязательные поля vs опциональные?
- [ ] Хранение в .metadata/project.json - правильно?

### 4. Engineer App - User Experience
- [ ] Auto-scan C:/4Stroke/ при запуске - правильно?
- [ ] File watcher для новых проектов - нужен?
- [ ] Keyboard shortcuts - какие критичны?
- [ ] System tray icon - minimize to tray?

---

### 🚀 FUTURE: Client Portal (ФАЗА 2)

**Отложено до завершения Engineer App:**
- [ ] Онлайн анкета для клиентов (структура)
- [ ] Чат (встроенный vs внешний Telegram/WhatsApp)
- [ ] Payment processing (Stripe/PayPal/ЮMoney)
- [ ] Publish workflow (как инженер публикует проект)
- [ ] Access control (как клиент получает доступ)

---

## 🔗 Related Documents

- `TECH_SPEC.md` - Техническое задание (основной проект)
- `prt-versioning-architecture-ru.md` - Предыдущая версия спецификации
- `test-data/4_Cyl_ITB.prt` - Пример .prt файла для парсинга

---

## 📊 Success Metrics

**Качественные:**
- ✅ Инженер может понять, что изменилось между любыми двумя расчётами
- ✅ Больше не нужны ручные Excel таблицы
- ✅ Полный audit trail эволюции проекта
- ✅ Можно "откатиться" к успешным конфигурациям

**Количественные (на основе типичной нагрузки):**
- 📊 **Объём работы:** ~50 проектов в год
- 📊 **Расчётов на проект:** ~10-50 расчётов (в среднем ~20)
- ⏱️ **Экономия времени:** ~5-10 минут на расчёт (нет ручной документации)
- 📈 **При 20 расчётах/проект:** экономия ~2-3 часа на проект
- 📈 **При 50 проектах/год:** экономия ~100-150 часов в год (2-3 недели работы!)
- 🎯 **Точность отслеживания:** 100% vs ~70% при ручном подходе
- 💰 **Conversion rate:** X% пользователей покупают Premium подписку
- 💰 **Target:** 20-30% conversion rate (1 из 4-5 пользователей)

---

## ✅ Status & Next Actions

**Статус документа:** 🟢 Финализированная архитектура  
**Дата последнего обновления:** 4 ноября 2025  
**Версия:** 2.0 (обновлено с учётом двух систем)

**Текущий этап:** ФАЗА 1 - Engineer App (desktop)

---

### ✅ Завершено:
1. ✅ Архитектурная спецификация создана
2. ✅ Две системы определены (Engineer App + Client Portal)
3. ✅ Scalability strategy продумана (переиспользование кода)
4. ✅ Workflow инженера задокументирован
5. ✅ Структура финального отчёта определена
6. ✅ Roadmap для двух фаз создан

---

### ⏳ Следующие шаги:

**Immediate (следующая сессия):**
1. Дизайн главной страницы (Projects Dashboard)
   - Mockup карточек проектов
   - Определить содержимое карточки
   - Фильтры и сортировка

**Short-term (1-2 недели):**
2. Создание детального технического задания для Claude Code
   - Stage 1: MVP - Core Functionality
   - Backend tasks (step-by-step)
   - Frontend tasks (step-by-step)

**Medium-term (2-3 месяца):**
3. Разработка Engineer App (Stage 1-4)
   - MVP → Configuration Management → Report Generator → Polish

**Long-term (после завершения Engineer App):**
4. Client Portal (ФАЗА 2)
   - Backend Infrastructure
   - Frontend
   - Integration с Engineer App

---

### 📌 Важные заметки:

**Принцип работы:**
- ✅ Без спешки, маленькими шагами
- ✅ Фокус на Engineer App (ФАЗА 1)
- ✅ Всегда помним о масштабировании (ФАЗА 2)
- ✅ "Build for scale, ship for now"

**Технологии выбраны правильно:**
- ✅ React + TypeScript → переиспользуем в Client Portal
- ✅ ECharts → те же графики в обеих системах
- ✅ Node.js + Express → backend можно масштабировать
- ✅ ~70-80% кода переиспользуем!

---

**Готов к следующему этапу: Дизайн Projects Dashboard** 🎨

---

**Конец документа**

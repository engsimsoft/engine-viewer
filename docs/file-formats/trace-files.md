# Trace Files - Phase 2 Documentation

**Статус:** Phase 2 (планируется)
**Приоритет:** MANDATORY
**Источник:** EngMod4T per-RPM output
**Дата создания:** 7 ноября 2025

---

## 📋 Overview

**Trace Files** - это детальные данные симуляции **vs Crank Angle (0-720°)** для каждого RPM point в batch run.

**Ключевые характеристики:**
- **Один файл = один RPM point** (например `Honda8000.cbt` для 8000 RPM)
- **Формат:** Fixed-width ASCII (как .det/.pou)
- **Данные:** Каждый градус коленвала (720 строк на цикл)
- **Парсинг:** `split(/\s+/)` - множественные пробелы
- **Reference:** Последний цилиндр используется как reference для crank angle

---

## 🎯 Common File Structure

**Все trace файлы имеют одинаковую структуру:**

```
Line 1-15:  Metadata (RPM, NumCyl, trace positions, pipe configuration)
Line 16:    Headers (parameter names)
Line 17+:   Data vs crank angle (0-720°, each degree)
```

**Naming Convention:**
```
ProjectName{RPM}.{ext}

Примеры:
- Honda8000.out   (Pressure trace at 8000 RPM)
- Honda8000.cbt   (Combustion trace at 8000 RPM)
- Honda8000.tpt   (Temperature trace at 8000 RPM)
```

**Общая первая колонка:**
- `Deg` - Engine degrees using the **last cylinder** as reference

---

## 📊 Supported Trace Types (7 форматов)

### Priority 1: Pressure & Flow Analysis

#### 1. Pressure Trace (.out)

**Extension:** `.out`
**Purpose:** Pressure traces at various locations in intake/exhaust system
**Parameters:** 12 колонок

| Parameter | Description | Units | Notes |
|-----------|-------------|-------|-------|
| `Deg` | Engine degrees (last cylinder reference) | degrees | Common column |
| `PinTrace` | Pressure at inlet transducer position (per cylinder) | ratio | Pressure ratio |
| `CompPr` | Turbocharger compressor pressure ratio | ratio | If turbocharged |
| `Pab` | Pressure in air box or intercooler header tank | ratio | If air box exists |
| `Pin` | Pressure at inlet valve (per cylinder) | ratio | Pressure ratio |
| `Pcyl` | Pressure in cylinder (per cylinder) | ratio | Pressure ratio |
| `Pex` | Pressure at exhaust valve (per cylinder) | ratio | Pressure ratio |
| `PexTrace` | Pressure at exhaust transducer position (per cylinder) | ratio | Pressure ratio |
| `TurbPr` | Turbocharger turbine pressure ratio | ratio | If turbocharged |
| `WastePr` | Waste gate pressure ratio | ratio | If waste gate exists |
| `Peb` | Pressure in exhaust box | ratio | If exhaust box exists |
| `PexOut` | Pressure at exhaust outlet pipes | ratio | Atmospheric outlets |

**Important:**
- **Values are RATIOS**, not absolute pressures!
- Ratio = Absolute Pressure / Atmospheric Pressure
- To get absolute: `P_absolute = ratio × P_atmospheric`

**Use Cases:**
- Gasdynamic wave analysis
- Tuned pipe length optimization
- Valve timing optimization
- Turbocharger performance analysis

---

#### 2. Mach Index (.mch)

**Extension:** `.mch`
**Purpose:** Mach number (flow velocity) at various locations
**Parameters:** 10 колонок

| Parameter | Description | Units | Notes |
|-----------|-------------|-------|-------|
| `Deg` | Engine degrees (last cylinder reference) | degrees | Common column |
| `InCamL/10` | Inlet valve lift profile | mm/10 | **Scaled down by 10!** |
| `ExCamL/10` | Exhaust valve lift profile | mm/10 | **Scaled down by 10!** |
| `InMach` | Mach index at inlet pipe trace position | ratio | Per inlet pipe |
| `InPMach` | Mach index at inlet valve in port (per cylinder) | ratio | Port mach |
| `InVMach` | Mach index through inlet valve seat (per cylinder) | ratio | Valve seat |
| `ExVMach` | Mach index through exhaust valve seat (per cylinder) | ratio | Valve seat |
| `ExPMach` | Mach index at exhaust valve in port (per cylinder) | ratio | Port mach |
| `ExMach` | Mach index at exhaust pipe trace position | ratio | Per exhaust pipe |
| `OutMach` | Mach index at atmospheric outlet | ratio | Outlet pipes |

**Important:**
- **Values are RATIOS**, not actual Mach numbers!
- Ratio = Particle Velocity / Sonic Velocity (calculated by simulation)
- **Valve lift profiles scaled down by 10** for graphing convenience

**Use Cases:**
- Flow velocity analysis
- Valve lift profile visualization
- Port flow optimization
- Acoustic analysis

---

#### 3. Mass Flow Trace (.dme)

**Extension:** `.dme`
**Purpose:** Mass flow rates at various locations
**Parameters:** 9 колонок

| Parameter | Description | Units | Notes |
|-----------|-------------|-------|-------|
| `Deg` | Engine degrees (last cylinder reference) | degrees | Common column |
| `MITrace` | Mass flow at inlet pipe trace position | kg/s × 1E6 | **Scaled!** |
| `ComprDM` | Mass flow through compressor | kg/s × 1E6 | If charged engine |
| `Min` | Mass flow through inlet valve seat (per cylinder) | kg/s × 1E6 | **Scaled!** |
| `Mex` | Mass flow through exhaust valve seat (per cylinder) | kg/s × 1E6 | **Scaled!** |
| `MXTrace` | Mass flow at exhaust pipe trace position | kg/s × 1E6 | **Scaled!** |
| `TurbDM` | Mass flow through turbine | kg/s × 1E6 | If turbocharged |
| `WasteDM` | Mass flow through waste gate | kg/s × 1E6 | If waste gate exists |
| `MexOut` | Mass flow at atmospheric outlet | kg/s × 1E6 | **Scaled!** |

**CRITICAL:**
- **ALL values multiplied by 1.0E6** (1,000,000) for graphing!
- To get actual mass flow: `M_actual = value / 1E6` (kg/s)
- Scaling allows graphing with other variables

**Use Cases:**
- Mass flow analysis
- Scavenging analysis (2-stroke)
- Turbocharger flow matching
- Port flow optimization

---

### Priority 2: Thermodynamics

#### 4. Temperature Trace (.tpt)

**Extension:** `.tpt`
**Purpose:** Temperature traces at various locations
**Parameters:** 10 колонок

| Parameter | Description | Units | Notes |
|-----------|-------------|-------|-------|
| `Deg` | Engine degrees (last cylinder reference) | degrees | Common column |
| `TinTrace` | Temperature at inlet pipe trace position | °C | Inlet system |
| `InTemp` | Temperature at inlet valve (per cylinder) | °C | Per cylinder |
| `Tab` | Temperature in air box | °C | If air box exists |
| `CylTemp` | Temperature in cylinder (per cylinder) | °C | Per cylinder |
| `TUnburnt` | Unburnt mixture temperature in cylinder | °C | Per cylinder |
| `TBurnt` | Burnt mixture temperature in cylinder | °C | Per cylinder |
| `ExTemp` | Temperature at exhaust valve (per cylinder) | °C | Per cylinder |
| `TexTrace` | Temperature at exhaust pipe trace position | °C | Exhaust system |
| `Teb` | Temperature in exhaust box | °C | If exhaust box exists |

**Important:**
- **Units:** Degrees Celsius (°C)
- **NOT ratios** - actual temperature values!

**Use Cases:**
- Thermal analysis
- Exhaust system design
- Turbocharger inlet temperature monitoring
- Cooling system requirements

---

#### 5. Efficiency Trace (.eff)

**Extension:** `.eff`
**Purpose:** Scavenging and charging efficiency
**Parameters:** 6 колонок (компактный!)

| Parameter | Description | Units | Notes |
|-----------|-------------|-------|-------|
| `Deg` | Engine degrees (last cylinder reference) | degrees | Common column |
| `DRatio` | Delivery ratio at inlet port (per cylinder) | - | Can exceed 1 |
| `PurCyl` | Purity in cylinder (per cylinder) | 0-1 | 1=pure air, 0=exhaust |
| `Seff` | Scavenging efficiency (per cylinder) | - | Overlap period |
| `Teff` | Trapping efficiency (per cylinder) | - | Can exceed 1 |
| `Ceff` | Charging efficiency (per cylinder) | - | Can exceed 1 |

**Important:**
- **Purity:** 0 = pure exhaust gas, 1 = pure air
- **Efficiencies can exceed 1.0** (supercharged/turbocharged)
- Most compact trace file (only 6 parameters!)

**Use Cases:**
- 2-stroke engine scavenging analysis
- Valve overlap optimization
- Forced induction efficiency
- Cylinder filling analysis

---

### Priority 3: Combustion Analysis

#### 6. Combustion Trace (.cbt)

**Extension:** `.cbt`
**Purpose:** Detailed combustion process analysis
**Parameters:** 31 колонка (самый детальный!)

**Geometry & Forces:**

| Parameter | Description | Units |
|-----------|-------------|-------|
| `Deg` | Engine degrees (last cylinder reference) | degrees |
| `HPistTDC` | Piston height from top of cylinder (per cylinder) | mm |
| `Torque` | Instantaneous torque produced/absorbed (per cylinder) | Nm |
| `VSqshAc` | Actual squish velocity (per cylinder) | m/s |
| `VSqshTh` | Theoretical squish velocity (per cylinder) | m/s |

**Mass Fractions:**

| Parameter | Description | Units |
|-----------|-------------|-------|
| `Mun` | Unburnt air mass ratio (per cylinder) | ratio |
| `Men` | Entrained air mass ratio (per cylinder) | ratio |
| `Mbt` | Burnt air mass ratio (per cylinder) | ratio |

**Turbulence:**

| Parameter | Description | Units |
|-----------|-------------|-------|
| `TurbInt` | Turbulent intensity (per cylinder) | m/s |
| `TurbInU` | Turbulent intensity unburnt zone (per cylinder) | m/s |
| `TurbDis` | Turbulent dissipation (per cylinder) | - |
| `Integral` | Integral length scale (per cylinder) | mm |
| `Taylor` | Taylor length scale (per cylinder) | mm |

**Flame Geometry:**

| Parameter | Description | Units |
|-----------|-------------|-------|
| `RFlame` | Radius of flame sphere (per cylinder) | mm |
| `AFlame` | Area of flame sphere (per cylinder) | mm² |
| `VFlame` | Volume of flame sphere (per cylinder) | mm³ |
| `RBurnt` | Radius of burnt sphere (per cylinder) | mm |
| `ABurnt` | Area of burnt sphere (per cylinder) | mm² |
| `VBurnt` | Volume of burnt sphere (per cylinder) | mm³ |

**Wall Heat Transfer:**

| Parameter | Description | Units |
|-----------|-------------|-------|
| `AWallU` | Exposed wall area in unburnt zone (per cylinder) | mm² |
| `AWallB` | Exposed wall area in burnt zone (per cylinder) | mm² |

**Energy & Mass:**

| Parameter | Description | Units |
|-----------|-------------|-------|
| `RoHR` | Rate of Heat Release (per cylinder) | kJ/deg |
| `Work` | Work done by cylinder (per cylinder) | kJ |
| `MCyl` | Total gas mass in cylinder (per cylinder) | kg |
| `MUCyl` | Unburnt gas mass in cylinder (per cylinder) | kg |
| `MBCyl` | Burnt gas mass in cylinder (per cylinder) | kg |

**Important:**
- **Most detailed trace file** (31 parameters!)
- Used for combustion model debugging
- Prescribed burn rate (Wiebe/Vibe): `Men` = `Mbt`

**Use Cases:**
- Combustion model validation
- Ignition timing optimization
- Heat release rate analysis
- Flame propagation study
- Turbulence modeling

---

### Priority 4: Turbocharger Analysis

#### 7. Turbocharger Trace (.tub)

**Extension:** `.tub`
**Purpose:** Turbocharger performance analysis
**Parameters:** 15 колонок

**Performance:**

| Parameter | Description | Units | Notes |
|-----------|-------------|-------|-------|
| `Deg` | Engine degrees (last cylinder reference) | degrees | Common column |
| `TurboRPM` | Turbocharger rotor RPM | RPM | Rotor speed |
| `ComprPr` | Pressure ratio across compressor | ratio | Boost |
| `CompEff` | Compressor efficiency | - | 0-1 |
| `TurbPr` | Pressure ratio across turbine | ratio | Expansion |
| `WastePr` | Pressure ratio across waste gate | ratio | If waste gate |

**Debugging (may be removed in future):**

| Parameter | Description | Units | Notes |
|-----------|-------------|-------|-------|
| `TurCenP` | Pressure in turbine center | ratio | **Debugging** |
| `TurCenT` | Temperature in turbine center | °C | **Debugging** |

**Mass Flows:**

| Parameter | Description | Units |
|-----------|-------------|-------|
| `ComprDM` | Compressor mass flow | kg/s |
| `TurStaDM` | Turbine stator mass flow | kg/s |
| `TurMapDM` | Turbine map mass flow | kg/s |
| `TurRotDM` | Turbine rotor mass flow | kg/s |
| `WasteDM` | Waste gate mass flow | kg/s |

**Power:**

| Parameter | Description | Units |
|-----------|-------------|-------|
| `CompPow` | Power absorbed by compressor | kW |
| `TurbPow` | Power generated by turbine | kW |

**Important:**
- **Under development** - some parameters may change in future EngMod4T versions
- `TurCenP`, `TurCenT` - debugging parameters, may be removed
- Mass flows NOT scaled (unlike .dme!)

**Use Cases:**
- Turbocharger matching
- Boost control optimization
- Waste gate tuning
- Compressor surge detection
- Turbine efficiency analysis

---

## 🔧 Implementation Guide

### Parser Architecture

**Universal Trace Parser** (Registry Pattern):

```javascript
// backend/src/parsers/formats/traceParser.js

const TRACE_TYPES = {
  'out': { name: 'Pressure', params: 12, unit: 'ratio' },
  'mch': { name: 'Mach', params: 10, unit: 'ratio', scaled: ['InCamL/10', 'ExCamL/10'] },
  'tpt': { name: 'Temperature', params: 10, unit: '°C' },
  'cbt': { name: 'Combustion', params: 31, unit: 'mixed' },
  'tub': { name: 'Turbocharger', params: 15, unit: 'mixed' },
  'eff': { name: 'Efficiency', params: 6, unit: 'ratio' },
  'dme': { name: 'MassFlow', params: 9, unit: 'kg/s', scaleFactor: 1e6 }
};

function parseTraceFile(filePath, extension) {
  const traceType = TRACE_TYPES[extension];
  if (!traceType) throw new Error(`Unknown trace type: ${extension}`);

  // Extract RPM from filename: "ProjectName8000.out" → 8000
  const rpm = extractRPMFromFilename(filePath);

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

  // Lines 1-15: Metadata
  const metadata = parseMetadata(lines.slice(0, 15));

  // Line 16: Headers
  const headers = lines[15].trim().split(/\s+/).slice(1); // Skip first column (№)

  // Lines 17+: Data (720 rows for 0-720 degrees)
  const data = [];
  for (let i = 16; i < lines.length; i++) {
    const values = lines[i].trim().split(/\s+/).slice(1); // Skip Deg column

    const row = { Deg: parseFloat(values[0]) };
    for (let j = 1; j < headers.length; j++) {
      let value = parseFloat(values[j]);

      // Apply scaling if needed
      if (traceType.scaleFactor) {
        value = value / traceType.scaleFactor;
      }

      row[headers[j]] = value;
    }

    data.push(row);
  }

  return {
    rpm,
    traceType: traceType.name,
    extension,
    metadata,
    headers,
    data, // 720 rows (0-720 degrees)
    units: traceType.unit
  };
}

// Registry
const parserRegistry = {
  '.out': (path) => parseTraceFile(path, 'out'),
  '.mch': (path) => parseTraceFile(path, 'mch'),
  '.tpt': (path) => parseTraceFile(path, 'tpt'),
  '.cbt': (path) => parseTraceFile(path, 'cbt'),
  '.tub': (path) => parseTraceFile(path, 'tub'),
  '.eff': (path) => parseTraceFile(path, 'eff'),
  '.dme': (path) => parseTraceFile(path, 'dme')
};
```

---

### Data Processing

**Scaling & Unit Conversion:**

```javascript
// Handle special cases
function processTraceData(traceData, extension) {
  switch (extension) {
    case 'mch':
      // Scale valve lift profiles back up
      traceData.data.forEach(row => {
        if (row['InCamL/10']) row.InCamL = row['InCamL/10'] * 10;
        if (row['ExCamL/10']) row.ExCamL = row['ExCamL/10'] * 10;
      });
      break;

    case 'dme':
      // Already scaled in parser (/ 1e6)
      break;

    case 'out':
      // Convert ratios to absolute pressures if needed
      const P_atm = traceData.metadata.atmosphericPressure || 101.325; // kPa
      traceData.data.forEach(row => {
        Object.keys(row).forEach(key => {
          if (key.startsWith('P')) {
            row[`${key}_absolute`] = row[key] * P_atm;
          }
        });
      });
      break;
  }

  return traceData;
}
```

---

### UI Components

**Trace Viewer Component:**

```typescript
// frontend/src/components/TraceViewer.tsx

interface TraceViewerProps {
  projectName: string;
  rpm: number;
  traceType: 'out' | 'mch' | 'tpt' | 'cbt' | 'tub' | 'eff' | 'dme';
  selectedParameters: string[];
}

function TraceViewer({ projectName, rpm, traceType, selectedParameters }: TraceViewerProps) {
  const [traceData, setTraceData] = useState(null);

  useEffect(() => {
    // Fetch trace data
    fetch(`/api/traces/${projectName}/${rpm}/${traceType}`)
      .then(res => res.json())
      .then(setTraceData);
  }, [projectName, rpm, traceType]);

  const chartOptions = {
    title: { text: `${traceType.toUpperCase()} Trace - ${rpm} RPM` },
    xAxis: {
      name: 'Crank Angle (deg)',
      min: 0,
      max: 720,
      axisLabel: { formatter: '{value}°' }
    },
    yAxis: selectedParameters.map((param, idx) => ({
      name: param,
      position: idx % 2 === 0 ? 'left' : 'right',
      offset: Math.floor(idx / 2) * 60
    })),
    series: selectedParameters.map((param, idx) => ({
      name: param,
      type: 'line',
      yAxisIndex: idx,
      data: traceData?.data.map(row => [row.Deg, row[param]]),
      smooth: false // Important for trace data!
    })),
    dataZoom: [
      { type: 'slider', xAxisIndex: 0, start: 0, end: 100 },
      { type: 'inside', xAxisIndex: 0 }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const deg = params[0].value[0];
        let tooltip = `<b>Crank Angle: ${deg}°</b><br/>`;
        params.forEach(p => {
          tooltip += `${p.seriesName}: ${p.value[1].toFixed(2)}<br/>`;
        });
        return tooltip;
      }
    }
  };

  return <EChartsReact option={chartOptions} style={{ height: '600px' }} />;
}
```

---

### Multi-RPM Comparison

**Compare Multiple RPM Points:**

```typescript
function MultiRPMTraceViewer({ projectName, rpms, traceType, parameter }) {
  // rpms = [3000, 4000, 5000, 6000]

  const series = rpms.map(rpm => ({
    name: `${rpm} RPM`,
    type: 'line',
    data: traceData[rpm]?.data.map(row => [row.Deg, row[parameter]])
  }));

  return (
    <EChartsReact
      option={{
        title: { text: `${parameter} vs Crank Angle` },
        legend: { data: rpms.map(r => `${r} RPM`) },
        series
      }}
    />
  );
}
```

---

## 📅 Phase 2 Roadmap

### Phase 2.1: Single Run Performance ✅

**Deliverables:**
- `.spo` file parser (single run performance)
- UI for single point visualization
- Comparison: single run vs batch run

**Duration:** 2 weeks

---

### Phase 2.2: Basic Traces (Core)

**Deliverables:**
- Pressure trace (.out) - **PRIORITY 1**
- Temperature trace (.tpt)
- Combustion trace (.cbt)
- Universal trace parser
- Trace viewer UI component
- Multi-parameter selection
- Crank angle zoom/pan

**Duration:** 3-4 weeks

**Success Criteria:**
- View pressure traces for any RPM point
- Compare multiple parameters on same chart
- Export trace data to CSV/Excel
- Zoom into specific crank angle ranges (e.g., 340-380° TDC region)

---

### Phase 2.3: Advanced Traces

**Deliverables:**
- Mach trace (.mch)
- Efficiency trace (.eff)
- Mass flow trace (.dme)
- Turbo trace (.tub)
- Multi-RPM comparison view

**Duration:** 2-3 weeks

**Success Criteria:**
- Overlay 3-4 RPM points on same chart
- Analyze flow patterns across RPM range
- Turbocharger performance maps

---

### Phase 2.4: Additional Formats (Optional)

**Remaining formats:**
- Wave trace (.wve)
- Purity trace (.pur)
- Port area (.epa, .ipa)
- Other formats (.cyl, .lds, .nse, .pvd, .wmf)

**Duration:** As needed

---

## 📚 Resources

**Source Documentation:**
- Performance Output: [_personal/EngMod4THelp-chapters/20-PerformanceFile.md](_personal/EngMod4THelp-chapters/20-PerformanceFile.md)
- Pressure Trace: [_personal/EngMod4THelp-chapters/21-PressureTrace.md](_personal/EngMod4THelp-chapters/21-PressureTrace.md)
- Mach Index: [_personal/EngMod4THelp-chapters/18-MachTrace.md](_personal/EngMod4THelp-chapters/18-MachTrace.md)
- Temperature: [_personal/EngMod4THelp-chapters/28-TemperatureTrace.md](_personal/EngMod4THelp-chapters/28-TemperatureTrace.md)
- Combustion: [_personal/EngMod4THelp-chapters/06-CombustionTrace.md](_personal/EngMod4THelp-chapters/06-CombustionTrace.md)
- Turbocharger: [_personal/EngMod4THelp-chapters/30-TurboTrace.md](_personal/EngMod4THelp-chapters/30-TurboTrace.md)
- Efficiency: [_personal/EngMod4THelp-chapters/08-EffTrace.md](_personal/EngMod4THelp-chapters/08-EffTrace.md)
- Mass Flow: [_personal/EngMod4THelp-chapters/19-MassTrace.md](_personal/EngMod4THelp-chapters/19-MassTrace.md)

**Related Documentation:**
- [EngMod4T Overview](../engmod4t-suite/engmod4t-overview.md)
- [Post4T Overview](../engmod4t-suite/post4t-overview.md)
- [File Formats README](README.md)

---

**Создано:** 7 ноября 2025
**Автор:** AI + User collaboration
**Статус:** Ready for Phase 2 implementation

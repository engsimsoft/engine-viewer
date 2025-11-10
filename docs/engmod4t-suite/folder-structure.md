# The Folder Structure used by the EngMod4T Suite of Programs

**Source:** Dat4T Help - Introduction to Dat4T
**Date:** November 7, 2025

---

## Overview

During the installation process the installer software creates the program folders and the working folder as well as shortcut Icons on the desktop.

### Folders Created:

1. **C:\4Stroke** - This is the working folder where all the Project files is stored.
2. **C:\Program Files (x86)\Dat4T** - The Dat4T executable, license file and Help files are installed to this folder.
3. **C:\Program Files (x86)\EngMod4T** - The EngMod4T executable, license file and Help file are installed to this folder.
4. **C:\Program Files (x86)\Post4T** - The Post4T executable and Help file are installed to this folder.
5. **C:\Program Files (x86)\Waveviewer4T** - The WaveViewer4T executable and Help files are installed to this folder.

Only the first folder is of any interest if everything is normal. The other folders are only accessed if there are issues with the software, most often when Windows decides to install the license file somewhere else.

---

## Working Folder - "C:\4Stroke"

The working folder is the one we are interested in. It is created when the software is installed and populated with some examples to supply a starting point for the new user to get up to speed.

### Service Files (in root of C:\4Stroke)

There are a number of files in this folder other than directly Project related files:

1. **Dat4TErrorLog.dat** - Every time Dat4T is started a new file is over written over the old one and It stores all the errors and commands used. Send this file with an error report when Dat4T gives a funny error or crashes, before opening Dat4T again as that will just over write the file.

2. **Dat4TLicenseCheck.dat** - Certain parts in Dat4T is only available if you have a valid license and this logs the checks.

3. **EngMod4TLicenseCheck.dat** - Every time EngMod4T is started the validity of the license is first verified. If you have any license issues please send this file.

4. **OldEngMod4TFile.fle** - This stores the choices made during the previous EngMod4T run to save time selecting them if the next run will use the same parameters.

5. **OldProjectFile.fle** - This stores the previous Project opened by Dat4T and loads it when Dat4T is opened again.

6. **Post4TErrorLog.dat** - Every time Post4T is started a new file is over written over the old one and It stores all the errors and commands used. Send this file with an error report when Post4T gives a funny error or crashes, before opening Post4T again as that will just over write the file.

7. **Post4TWorkDir.dat** - Stores the Post4T working folder of the previous run, not yet used for anything.

---

## Project Layout

Dat4T creates or edits projects for use by EngMod4T. A project consists of a collection of subsystems that are stored in individual files. A main project file contains the list of subsystem files. The name of this project file is the name of the engine to be simulated.

### Project File (in root of C:\4Stroke)

**ProjectName.pjt** - This file contains a list of all the subsystem file names. When a new project is created Dat4T automatically creates subsystem files with the project name. The user can then use these names or change them to existing subsystem names. If the new names are used they will be empty subsystems that has to be populated by the user.

### Subsystem Files (in root of C:\4Stroke)

A project consists of the following subsystems:

#### Engine Subsystem (EngineName.eng)

The engine subsystem describes the basic engine layout and geometry. It also contains some starting values and control values for the main simulation.

#### Exhaust Cam, Port and Valve Subsystem (ExhaustPortName.exp)

This contains all the data for the exhaust cam, the port dimensions, the flow conditions and the number and dimensions of the valves.

#### Inlet Cam, Port and Valve Subsystem (InletPortName.ipo)

This contains all the data for the inlet cam, the port dimensions, the flow conditions and the number and dimensions of the valves.

#### Exhaust Subsystem (ExhaustName.exl, ExhaustName.exd)

These files contain all the relevant information to describe the type and layout of the exhaust system. The first file describes the type of system, sets up the atmospheric and plenum connectivity, specifies the collector angles and plenum volumes and gives the length dimensions of all the pipes.

The second file contains all the pipe diameters.

#### Intake Subsystem (IntakeName.inl, IntakeName.ind)

These files contain all the relevant information to describe the type and layout of the intake system. The first file describes the type of system, sets up the atmospheric and plenum connectivity, specifies the collector angles, plenum volumes and throttle type and dimensions and gives the length dimensions of all the pipes.

The second file contains all the pipe diameters.

#### Combustion and Ignition Subsystem (CombustionName.cbd)

This subsystem describes the combustion model and parameters, specifies the type of fuel and the combustion efficiency and contains generic combustion chamber details.

#### Temperature and Atmospheric Subsystem (TemperatureName.tmp)

This subsystem prescribes the wall surface temperatures of the combustion chamber and all the ducts as well as the atmospheric temperature and pressure.

#### Turbocharger and Boost Control Subsystem (TurbochargerName.trb)

This subsystem defines the turbocharger installation layout, the type of boost control and gives the names of the compressor and turbine maps.

### Additional Files

A project contains additional files, some are currently being used and others are meant for use with future upgrades of the software.

- **ExhaustName.sil** - Currently used to contain the exhaust silencer data. The silencer subsystem is still undergoing development and is only partially active.

- **ExhaustPortName.exc** - This file is being used to contain the exhaust valve lift profile in the format as used by EngMod4T.

- **IntakePortName.inc** - This file is being used to contain the intake valve lift profile in the format as used by EngMod4T.

- **ProjectName.prt** - This file gives a printable summary all the subsystems as contained in the project file.

---

## Project Folder - "C:\4Stroke\ProjectName"

Once a simulation of a Project is run a folder is created with the name of the Project and all the result files are stored in this folder.

**Example:** After running a simulation of project "Blast" at 8000 rpm, the folder `C:\4Stroke\Blast\` is created.

### Single Run Results

In this folder is a list of all the simulation results at 8000rpm, they are the files with the "8000" appended to the name but before the extention. These are the files used by Post4T to display the "Trace" values. There are also three new files without the "8000" in the name. They are the following and is used for specific outputs:

1. **ProjectName.dat** - This file (.dat) lists the running of the main simulator, EngMod4T, and captures errors. Any time a simulation crashes this is the file you send to report the error and ask for assistance.

2. **ProjectName.spo** - The performance results for a single run is stored in this file (.spo). To see the values inside it, open it with a normal text editor, something like "Wordpad" or "Notepad++".

3. **ProjectName.des** - The detonation results for a single run is stored in this file (.des). To see the values inside it, open it with a normal text editor, something like "Wordpad" or "Notepad++".

Note that both the last two files are appended during each batch run so the performance and detonation results are just added during each run.

### Batch Run Results

After a "Batch" run there are a lot more files with the results for each rpm point in the batch run. There are now two new files which we are interested in.

1. **ProjectName.det** - Batch run performance and detonation results (24 parameters: RPM, Power, Torque, PCylMax, Deto, Convergence, etc.). Despite the name "detonation file", it contains complete performance dataset including detonation indicator. ✅ **Used by engine-viewer.**

2. **ProjectName.pou** - The performance results for a batch run is stored in this file (.pou). To see the values inside it, open it with Post4T. ✅ **Used by engine-viewer.**

Note that both these files are appended during each batch run so the performance and detonation results are just added during each run.

### Advanced Users

There are three files created with each RPM point that lists the instantaneous port open area against crank angle. These files are not opened by Post4T but requires Microsoft Excel to open and plot.

1. **ProjectName8000.epa** - This file (.epa) lists the exhaust port open area against crank angle.

2. **ProjectName8000.ipa** - This file (.ipa) lists the inlet port open area against crank angle.

3. **ProjectName8000.*** - Trace values for specific RPM point, used by Post4T.

---

## Real C:\4Stroke Structure (Example)

**IMPORTANT:** The structure is NOT flat - it's a **MIXED layout:**
- ✅ **.prt files and ALL subsystem files are in ROOT** of C:\4Stroke\
- ✅ **Result files (.det, .pou, etc.) are INSIDE PROJECT FOLDERS** C:\4Stroke\ProjectName\

```
C:\4Stroke\
│
├── Dat4TErrorLog.dat                   # Service files
├── Dat4TLicenseCheck.dat
├── EngMod4TLicenseCheck.dat
├── OldEngMod4TFile.fle
├── OldProjectFile.fle
├── Post4TErrorLog.dat
├── Post4TWorkDir.dat
│
├── Blast.prt                           # Project files (in root)
├── Blast.pjt
├── Blast.eng
├── Blast.exp
├── Blast.ipo
├── Blast.exl
├── Blast.exd
├── Blast.inl
├── Blast.ind
├── Blast.cbd
├── Blast.tmp
├── Blast.trb
├── Blast.exc
├── Blast.inc
├── Blast.sil
│
└── Blast\                              # Project folder (results)
    ├── Blast.dat                       # Single run logs
    ├── Blast.spo                       # Single run performance
    ├── Blast.des                       # Single run detonation
    ├── Blast.det                       # ✅ Batch performance + detonation (24 params, engine-viewer)
    ├── Blast.pou                       # ✅ Batch performance (engine-viewer)
    ├── Blast8000.epa                   # Port area data (Excel)
    ├── Blast8000.ipa                   # Port area data (Excel)
    └── Blast8000.*                     # Trace values for 8000 RPM
```

**Same structure for development (test-data/):**

```
test-data/                              # Development folder (macOS)
│
├── BMW M42.prt                         # ✅ .prt in ROOT
├── BMW M42/                            # ✅ Results in FOLDER
│   ├── BMW M42.det
│   └── BMW M42.pou
│
├── Vesta 1.6 IM.prt                    # ✅ .prt in ROOT
├── Vesta 1.6 IM/                       # ✅ Results in FOLDER
│   ├── Vesta 1.6 IM.det
│   └── Vesta 1.6 IM.pou
│
└── 4_Cyl_ITB.prt                       # ✅ .prt in ROOT
    └── 4_Cyl_ITB/                      # ✅ Results in FOLDER
        ├── 4_Cyl_ITB.det
        └── 4_Cyl_ITB.pou
```

---

## Files Used by engine-viewer

Engine Results Viewer works with files from EngMod4T Suite:

### Input Files (reads):

1. **ProjectName.prt** - Parsed to extract engine metadata:
   - Cylinders (number of cylinders)
   - Bore and Stroke (geometry)
   - Engine Type (4-stroke)
   - Intake System (ITB/IM/Carb)
   - Location: `C:\4Stroke\ProjectName.prt` or `test-data/ProjectName.prt`

2. **ProjectName.det** - Batch run performance and detonation results (24 parameters):
   - Location: `C:\4Stroke\ProjectName\ProjectName.det` or `test-data/ProjectName/ProjectName.det`
   - Contains: All base performance metrics (RPM, Power, Torque, PurCyl, TUbMax, TCylMax, PCylMax, Deto, Convergence)
   - Used for performance and detonation analysis

3. **ProjectName.pou** - Batch run performance results:
   - Location: `C:\4Stroke\ProjectName\ProjectName.pou` or `test-data/ProjectName/ProjectName.pou`
   - Used for performance charts

### Output Files (creates):

1. **ProjectName.json** - Metadata files:
   - Location: `.metadata/project-name.json` (in engine-viewer root - CURRENT state)
   - Contains user metadata (description, status, tags, notes)

### Structure in engine-viewer (current state):

```
engine-viewer/
├── .metadata/                          # Metadata storage (current)
│   ├── bmw-m42.json
│   ├── vesta-16-im.json
│   └── 4-cyl-itb.json
│
└── test-data/                          # Development data
    ├── BMW M42.prt                     # ✅ Read by parser
    ├── BMW M42/
    │   ├── BMW M42.det                 # ✅ Read by parser
    │   └── BMW M42.pou                 # ✅ Read by parser
    │
    ├── Vesta 1.6 IM.prt                # ✅ Read by parser
    ├── Vesta 1.6 IM/
    │   ├── Vesta 1.6 IM.det            # ✅ Read by parser
    │   └── Vesta 1.6 IM.pou            # ✅ Read by parser
    │
    └── 4_Cyl_ITB.prt                   # ✅ Read by parser
        └── 4_Cyl_ITB/
            ├── 4_Cyl_ITB.det           # ✅ Read by parser
            └── 4_Cyl_ITB.pou           # ✅ Read by parser
```

---



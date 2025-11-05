## [Mach Index Output (\*.mch)]{.underline}

The mach index files are part of the new or over written files. They have the project name appended with the rpm value and the extension **.mch**. The mach index traces for project Honda at 8000 rpm will be in the file: **Honda8000.mch**. This file will be in the project directory and over written each time a simulation at its specific rpm is conducted.

It has the following traces as output:

- **Deg**              Engine degrees using the last cylinder as reference.
- **InCamL/10**  Inlet Valve Lift Profile scaled down by a factor 10.
- **ExCamL/10**  Exhaust Valve Lift Profile scaled down by a factor 10.
- **InMach**        Mach index trace at the trace position in each inlet pipe.
- **InPMach**      Mach index trace at the inlet valve in the port per cylinder.
- **InVMach**      Mach index trace through the inlet valve seat per cylinder.
- **ExVMach**     Mach index trace through the exhaust valve seat per cylinder.
- **ExPMach**      Mach index trace at the exhaust valve in the port per cylinder.
- **ExMach**        Mach index trace at the trace position in each exhaust pipe.
- **OutMach**      Mach index trace at each atmospheric outlet of the exhaust pipe system.

[[ ]{lang="EN-UK" style="font-size:12.0pt"}]{lang="EN-UK" style="font-size:12.0pt"}

The mach index traces are not mach values but mach ratios, they are the calculated particle velocity divided by the reference sonic velocity calculated by the simulation.

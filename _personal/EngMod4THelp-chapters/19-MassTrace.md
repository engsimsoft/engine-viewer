## [Mass Flow Trace (\*.dme)]{.underline}

The mass flow trace files are part of the new or over written files. They have the project name appended with the rpm value and the extension **.dme**. The mass flow traces for project Honda at 8000 rpm will be in the file: **Honda8000.dme**. This file will be in the project directory and over written each time a simulation at its specific rpm is conducted.

It has the following traces as output:

- **Deg**                Engine degrees using the last cylinder as reference.
- **MITrace**        Mass flow trace at the trace position in each inlet pipe.
- **ComprDM**     Mass flow trace through the compressor if it is a charged engine.
- **Min**                Mass flow trace through the inlet valve seat per cylinder.
- **Mex**               Mass flow trace through the exhaust valve seat per cylinder.
- **MXTrace**       Mass flow trace at the trace position in each exhaust pipe.
- **TurbDM**         Mass flow trace through the turbine if it is a turbocharged engine.
- **WasteDM**     Mass flow trace through the waste gate if it is a turbocharged engine.
- **MexOut**         Mass flow trace at each atmospheric outlet of the exhaust pipe system.

The mass flow traces are multiplied by a factor 1.0E6 to allow graphing with the other variables.

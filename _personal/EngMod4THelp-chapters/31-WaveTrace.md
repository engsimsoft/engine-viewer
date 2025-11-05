## [Wave Pressure Trace Output (\*.wve)]{.underline}

The wave pressure trace files are part of the new or over written files. They have the project name appended with the rpm value and the extension **.wve**. The pressure traces for project Honda at 8000 rpm will be in the file: **Honda8000.wve**. This file will be in the project directory and over written each time a simulation at its specific rpm is conducted.

It has the following traces as output:

- **Deg**            -  Engine degrees using the last cylinder as reference.
- **PinLeft**       - Pressure trace of the left moving (away from the cylinder) pressure wave at the trace position in each inlet pipe.
- **PinRight**     - Pressure trace of the right moving (towards the cylinder) pressure wave at the trace position in each inlet pipe.
- **PipLeft**       - Pressure trace of the left moving (away from the cylinder) pressure wave at the inlet valve per cylinder.
- **PipRight**     - Pressure trace of the right moving (towards the cylinder) pressure wave at the inlet valve per cylinder.
- **PepLeft**      - Pressure trace of the left moving (towards the cylinder) pressure wave at the exhaust valve per cylinder.
- **PepRight**    - Pressure trace of the right   moving (away from the cylinder) pressure wave at the exhaust valve per cylinder.
- **PexLeft**      - Pressure trace of the left moving (towards the cylinder) pressure wave at the trace position in each exhaust pipe.
- **PexRight**    - Pressure trace of the right   moving (away from the cylinder) pressure wave at the trace position in each exhaust pipe.

The wave pressure traces are not pressure values but pressure ratios, they are the absolute pressure of the left or right moving pressure waves divided by the atmospheric pressure the simulation was conducted at.

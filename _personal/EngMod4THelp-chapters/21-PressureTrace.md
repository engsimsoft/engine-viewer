## [Pressure Trace Output (\*.out)]{.underline}

The pressure trace files are part of the new or over written files. They have the project name appended with the rpm value and the extension .out. The pressure traces for project Honda at 8000 rpm will be in the file: **Honda8000.out**. This file will be in the project directory and over written each time a simulation at its specific rpm is conducted.

It has the following traces as output:

- **Deg**           Engine degrees using the last cylinder as reference.
- **PinTrace**   Pressure trace at the prescribed inlet pressure transducer position per cylinder.
- **CompPr**    Pressure ratio at the turbocharger compressor if there is a turbocharger.
- **Pab**            Pressure trace per air box or intercooler header tank but only if there is an air box.
- **Pin**             Pressure trace at the inlet valve per cylinder.
- **Pcyl**           Pressure trace in the cylinder per cylinder.
- **Pex**            Pressure trace at the exhaust valve.
- **PexTrace**  Pressure trace at the prescribed exhaust pressure transducer position per cylinder.
- **TurbPr**      Pressure ratio at the turbocharger turbine if there is a turbocharger.
- **WastePr**    Pressure ratio at the turbocharger waste gate if there is a turbocharger and a waste gate.
- **Peb**            Pressure trace per exhaust box but only if there is an exhaust box.
- **PexOut**      Pressure trace at each exhaust outlet pipe.

The pressure traces are not pressure values but pressure ratios, they are the absolute pressure divided by the atmospheric pressure the simulation was conducted at.

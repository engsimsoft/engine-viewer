## [Efficiency Trace Output (\*.eff)]{.underline}

The efficiency trace files are part of the new or over written files.
They have the project name appended with the rpm value and the extension
.eff. The efficiency traces for project Honda at 8000 rpm will be in the
file: **Honda8000.eff**. This file will be in the project directory and
over written each time a simulation at its specific rpm is conducted.

It has the following traces as output:

- **Deg **           Engine degrees using the last cylinder as
  reference.
- **DRatio**       Delivery ratio trace at the inlet port per cylinder.
- **PurCyl**       Purity trace in the cylinder per cylinder.
- **Seff**            Scavenging efficiency trace per cylinder where the
  scavening period is defined as the overlap period.
- **Teff**            Trapping efficiency trace per cylinder.
- **Ceff**            Charging efficiency trace per cylinder.

The purity traces has a value of 1 for pure air and a value of 0 for
pure exhaust gas. Any mixture of the two will have a value between 0
and 1. The efficiencies and delivery ratio can exceed 1.

To load efficiency traces the following radio button is selected:

![](04-Pictures/RadioEffTrace.jpg){border="0"}

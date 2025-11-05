## Design Verification

On the main subsystem editing dialog is a button \"**STA**\" which opens a dialog \"**Specific Time Area**\":

![](../Pictures/STA-Button.jpg){border="0"}

The purpose of this dialog is to bring the inlet port / valve train, the exhaust port / valve train and the cylinder bore and capacity together to verify that the model is possible and not just a theoretical construct. There are recommended values calculated for some of the displayed values but these are just to get into the ball park and not the final target value and it should be used as such.

### The STA dialog

The STA dialog displays the STA values for the engine plus a number of other characteristics that can be used to verify the engine and port as modeled.

![](../Pictures/STA.jpg){border="0"}

### Engine Performance

In this section the target BMEP is entered by the modeler and this is used to calculate the required power output and the target STA values. The mean piston speed is calculated for the target rpm as entered on the Engine dialog from the stroke.

![](../Pictures/STA-Performance.jpg){border="0"}

Mean piston speed at the RPM entered is shown, and modern designs are capable of 25m/s (\~5000ft/min) (at the max rpm) with reliability, while on older engines the limit is nearer to 20m/s (\~4000ft/min). The value for drag engines are often much higher, up to or exceeding 35m/s (\~7000ft/min).

It is assumed that the user will attempt to configure the engine\'s overall efficiency characteristics to enable the entered power to be achieved.

### Valve Lift Profiles

The valve lift profiles are displayed on the same graph and a number of the valve event characteristics are calculated and displayed.

![](../Pictures/STA-LiftProfile.jpg){border="0"}

### Port Size at Manifold

The target port size values are to be used only a very rough guidelines when creating a new engine or when analysing an existing engine. They are the result of averaging these values for a large number of engines at various states of tune and with a range of design goals.

![](../Pictures/STA-PortSizes.jpg){border="0"}

The following equations are used to calculate the recommended values with the added sophistication of K~im~ and K~em~ being functions of the requested BMEP value.

![](../Pictures/PortManifoldAreaRatio.jpg){border="0"}

Note that these values are based purely on the inner seat diameter and not on any flow or wave tuning requirement. The typical modern engine has a much smaller exhaust port passage and the K~em~ value is closer to 1.0.

### Valve Diameter and Flow Area Ratios

These outputs give ratios between the diameters of the valves and the bore size as well as the ratios of the flow areas at full lift to the bore cross sectional area.

![](../Pictures/STA-ValveRatios.jpg){border="0"}

### STA-Values

The concept of Specific Time Area (STA) was developed to satisfy two requirements:

1.  Designing a new engine with a specific performance target requires a good starting point for the camming and valving from which the simulation can be used to refine the requirements.
2.  Analysing an existing engine to determine its design targets also requires a methodology where the performance goals of the valve sizes and open duration can be deduced.

The STA methodolgy was developed to meet these requirements. It is a semi-empirical method that relates BMEP (Brake Mean Effective Pressure), RPM, Capacity and valve flow areas and duration to one another. The results are empirical and never totaly accurate but it is quite effective in creating starting values for a new design or analysing and comparing existing designs.

The target STA (Specific Time Area) values are to be used only a very rough guideline when creating a new engine or when analysing an existing engine. They are the result of averaging these values for a large number of engines at various states of tune and with a range of design goals.

![](../Pictures/STA-STAvalues.jpg){border="0"}

### Head Layout

The head layout is a first order fit of the valve sizes as specified in the port dialogs at the included valve angle as specified in the engine dialog in the specified bore size. It is used as an indication of whether the sizes specified is practical and can fit. No attempt has been made to optimize the positions.

![](../Pictures/STA-HeadLayout.jpg){border="0"}

# **[Description of Engine Parameters]{.underline}**

When creating a new engine the following dialog will appear:

![](../Pictures/NewEngine.jpg){border="0"}

### **[Engine Induction]{.underline}**

The user can choose between \"**Naturally Aspirated**\", \"**Turbocharged**\" or \"**Supercharged**\".

### [Combustion Type]{.underline}

The next choice is the type of ignition system. There are two types to choose from; **spark ignition** (typically gasoline or alcohol) and **compression ignition** (typically diesel). The choice will influence the loss factors for mechanical efficiency and the fuel types available in the combustion subsystem.

### **[Engine Layout]{.underline}**

If the number of cylinders are larger than 1 the type of engine layout has to be specified. There are three possible choices:

- Inline engine
- V-layout
- Flat layout (also known as opposed cylinders or boxer)

### **[Friction Model]{.underline}**

The user can choose between \"**Plain**\" or  \"**Roller**\" bearings or a \"**User Defined**\" friction loss model. The type of bearing is used in the friction loss calculations. Most other engines use the plain bearing type. The \"**User Defined**\" model requires the user to supply two or three values, a static component that stays the same through the rpm sweep, a dynamic component that is the slope of the loss characteristic that is rpm dependent and a speed loss component that is a function of the rpm squared. The user can by manipulating these values take the loss of a rear wheel dyno into consideration.

![](../Pictures/FrictionModel.jpg){border="0"}

**Loss Coefficient:** This is a value that is independent of engine speed, seal friction, plain bearings etc. contribute to this value. Seals have a value of around 1000 while plain bearings a value of around 100 000.

**Loss Slope:** This is the slope of the speed dependant value of the friction loss. A typical ball or roller bearing engine has a loss slope of about +100. Currently the user is allowed to specify only a linear dependence on speed. A more sophisticated model will follow that allows a non-linear dependence.

**Speed Loss:** This is the coefficient of the rpm squared in a friction model where the loss is not a straight line.

The user can model the crankshaft bearings, valve train and reciprocating components in a separate program called **\"FMEP\"** to determine these three values.

On a rear wheel dyno all sorts of additional losses comes into play, some might decrease with speed, others stay constant and some increase with speed. The user will have to experiment to find the model that simulates his setup the best.

##  

## [Basic Engine Data]{.underline}

### **[Number of Cylinders]{.underline}**

Choose the number of cylinders. If for instance a V-engine is modeled where no interconnection exists between the intake and the exhaust system of the left and right hand banks of cylinders it is more efficient to model only one bank. This reduces run times. If the exhaust and intake systems are completely separate for each cylinder it is only necessary to model one cylinder.

### **[Bore]{.underline}**

Enter the cylinder bore in millimeters. Only round bores are modeled.

### **[Stroke]{.underline}**

Enter the stroke length in millimeters. Strictly speaking this is twice the crank throw as the stroke will increase slightly if an offset is defined for the gudgeon pin.

### **[Conrod Length]{.underline}**

Enter the conrod length in millimeters. It is the length from the center of the big-end eye to the center of the small-end eye. The length of the conrod influences the movement of the piston and should be as accurate as possible.

### **[Gudgeon Pin and/or Cylinder Offset]{.underline}**

Enter the offset in millimeters. A positive number is used if the offset is in the direction of rotation and a negative number if the offset is in the opposite direction of crank rotation. The offset influences the movement of the piston and should be as accurate as possible. A positive value means the offset is in the direction of crankshaft rotation.

### **[Geometric Compression Ratio]{.underline}**

This is the compression ratio calculated using the full stroke and is used to determine the trapped head volume at TDC.

### **[Squish Area Ratio]{.underline}**

This is the area ratio calculated using the area of the squish band divided by the bore cross sectional area. It is constrained to values from 0.0 to 0.7.

### [Piston Dome Radius]{.underline} ****

The radius of the piston dome in millimeters. Currently the squish radius is calculated internally by the software to the sum of the piston dome radius and the squish clearance, giving a parallel squish clearance.

### **[RPM at maximum power]{.underline}**

This value is used in the pipe wall temperature subroutine where the pipe wall temperature is scaled according to the simulated rpm in relation to the maximum power rpm. It is also used to calculate the Specific Time Areas.

### **[Exhaust Transducers]{.underline}**

The software allows the placement of a transducer in each exhaust port or header pipe as well as in the rest of the exhaust pipes. All the so called \"trace\" results in the result files are at these points.

At these points the software outputs the pressure, temperature, mach index and the left and right moving wave pressure values.

For the header pipes this dimension is the distance the transducer is placed from the exhaust valve face in millimeters. If the distance is greater than the exhaust port length it is automatically placed in the header pipe else it is in the port. If the distance places it further away from the port face than the sum of the port and header lengths it is positioned at the end of the header pipe.

For the other pipes this dimension is the distance from the start of that particular pipe. If the dimension is greater than the length of that pipe it is placed at the end of the pipe. See [Exhaust Trace Definition](ExhaustTrace.htm) for more information.

### **[Intake Transducers]{.underline}**

The software allows the placement of a transducer in each intake pipe.  All the so called \"trace\" results in the result files are at these points.

At these points the software outputs the pressure, temperature, mach index and the left and right moving wave pressure values.

For the cylinder pipe this dimension is the distance the transducer is placed from the intake valve face in millimeters. If the distance is greater than the cylinder pipe it is automatically placed in the cylinder pipe.

For the other pipes this dimension is the distance from the end of that particular pipe. If the dimension is greater than the length of that pipe it is placed at the start of the pipe. See [Inlet Trace Definition](InletTrace.htm) for more information.

### **[Number of Iteration Cycles]{.underline}**

This determines the number of complete engine cycles (where one cycle is two revolutions) that the engine will be simulated for. The minimum allowed is 8 as this is typically the least number of cycles for the calculation of a naturally aspirated to stabilize.

#### 1. Naturally Aspirated

Some engines require more but very seldom more than 12 cycles. In general the points after max power require more cycles to stabilize so a suggestion is to run a simulation for the highest rpm point required for 20 cycles without graphics and to inspect the results to determine after how many cycles the simulation has stabilized to your satisfaction. Set the number of cycles to this value.

#### 2. Mechanical Supercharged

Start with 30 cycles, some engines require more but very seldom more than 80 cycles. A turbocharged engine typically requires 5 times as many cycles for the gasdynamics to stabilize compared to a naturally aspirated engine. In general the points after max power require more cycles to stabilize so a suggestion is to run a simulation for the highest rpm point required for 100 cycles without graphics and to inspect the results to determine after how many cycles the simulation has stabilized to your satisfaction. Set the number of cycles to this value.

#### 3. Turbocharged

Start with 80 cycles, some engines require more but very seldom more than 120 cycles. A turbocharged engine typically requires **10 times** as many cycles for the gasdynamics to stabilize compared to a naturally aspirated engine. To assist the simulation the turbocharger speed is fixed for the first 8 cycles and then the compressor and turbine maps is progressively built up until cycle 18. The first realistic but not converged results are from cycle 40 onwards.

In general the points after max power require more cycles to stabilize so a suggestion is to run a simulation for the highest rpm point required for 200 cycles without graphics and to inspect the results to determine after how many cycles the simulation has stabilized to your satisfaction. Set the number of cycles to this value.

### [**Throttle Open Ratio**]{.underline}

This is a number greater than 0 and less or equal to 1. If the slide or butterfly has moved through 50% of its lift or angle the ratio is 0.5 etc. Note that this function is only active if an inlet system with a throttle is selected.

### **[Engine Firing Order and Layout of the Crankshaft]{.underline}**

A range of firing orders and crank layouts are available. This include single plane, two plane and multi-plane crank layouts with most of the more common firing orders available.

### [Combustion Chamber Layout]{.underline}

The user selects the layout that mostly resembles the engine being modeled. This will be used in the turbulent combustion model to calculate the influence of swirl, tumble or a combination of the two, sometimes called \"swumble\".

The user also has to specify the included angle between the inlet and exhaust valve. This value is not currently used but planned for a future update of the \"tumble\" generation model.

---

**[[Editing an Existing Engine]{lang="EN-US" style="font-size:14.0pt;mso-bidi-font-size:10.0pt"}]{.underline}**

[When choosing to edit the engine from the main menu an engine submenu is displayed with the current engine characteristics. Choose the value to be changed and implement the change.]{lang="EN-US" style="font-size:12.0pt;mso-bidi-font-size:10.0pt"}

![](../Pictures/EditEngine.jpg){border="0" width="1020" height="660"}

[Once the values have been changed enter "Accept and Save" to return to the main menu. Refer to [New Engine](NewEngine.htm) for an explanation of the variables.]{lang="EN-US" style="font-size:12.0pt;mso-bidi-font-size:10.0pt"}

---

# Cylinder Numbering

The cylinders are numbered using DIN 73021 as guideline. It basically states that looking at the engine from the front, that is the opposite end from where the power output is, the cylinders are number from front to back starting with the bank on the left side first and then moving in a clockwise direction to the next bank and so on.

The following figures show the layout and numbering sequence for typical engines as modeled by Dat4T:

![](../Pictures/cylindernumbering-i.jpg){border="0" width="315" height="242"}

**Straight Engines**

![](../Pictures/cylindernumbering-v.jpg){border="0" width="353" height="225"}

**Vee Engines**

![](../Pictures/cylindernumbering-f.jpg){border="0" width="334" height="177"}

**Flat or Boxer Engines**

---

# **[Description of Exhaust Trace Positions]{.underline}**

The software allows the placement of a transducer in each exhaust port or header pipe as well as in the rest of the exhaust pipes. All the so called \"trace\" results in the result files are at these points.

At these points the software outputs the pressure, temperature, mach index and the left and right moving wave pressure values.

For the header/tuned pipes this dimension is the distance the transducer is placed from the exhaust valve face in millimeters. If the distance is greater than the exhaust port it is automatically placed in the header pipe else it is in the port. If the distance places it further away from the port face than the sum of the port and header length it is positioned at the end of the header  pipe.

For the other pipes this dimension is the distance from the start of that particular pipe. If the dimension is greater than the length of that pipe it is placed at the end of the pipe. In the next figure this is illustrated for a single cylinder pipe.

![](../Pictures/ExTraceSingle-4T.jpg){border="0"}

In this example the trace distance is shown to be almost halfway down the pipe 1. If the distance was shorter than the exhaust port length the trace position would have been in the exhaust port. For the pipe 2, the specified trace position is shorter than the pipe and the trace is placed at the trace length from the start of this pipe.

Note that the trace number corresponds to the pipe number and that all the traces is the same distance from the start of the pipe, unless the specified distance is greater than the pipe length, then the trace is at the end of the pipe. The next figure shows the trace positions for a multi-cylinder exhaust system.

![](../Pictures/Ex4in1Trace-4T.jpg){border="0"}

 

 

---

# **[Description of Inlet Trace Positions]{.underline}**

The software allows the placement of a transducer in each intake pipe.  All the so called \"trace\" results in the result files are at these points.

At these points the software outputs the pressure, temperature, mach index and the left and right moving wave pressure values.

For the inlet port this dimension is the distance the transducer is placed from the intake valve face in millimeters. If the distance is greater than the inlet port it is automatically placed in the cylinder pipe. 

For the other pipes this dimension is the distance from the end of that particular pipe. If the dimension is greater than the length of that pipe it is placed at the start of the pipe. In the next figure this is illustrated for a single cylinder inlet with a throttle and boost bottle.

![](../Pictures/InThrot1BoostTrace-4T.jpg){border="0"}

In this example the trace distance is shown to be almost halfway down the cylinder pipe, pipe 1. In the throttle body pipe, pipe 3, and the boost bottle pipe, pipe 4, this places the trace almost at the start of each pipe. For the connector pipe, pipe 2, the specified trace position is longer than the pipe and the trace is placed at the start of this pipe.

The next figure shows the positions of the inlet traces on a multi-cylinder engine. Note that the trace number corresponds to the pipe number and that all the traces is the same distance from the end of the pipe, unless the specified distance is greater than the pipe length, then the trace is at the start of the pipe.

![](../Pictures/InColThrot4Trace-4T.jpg){border="0"}

 

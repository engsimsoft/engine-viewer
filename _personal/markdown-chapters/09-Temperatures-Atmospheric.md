# **Description of Temperature and Atmospheric Data**

When creating a new temperature subsystem the program will display a dialog box with default engine cooling systems to select from:

![](../Pictures/TemperatureModelSelection.jpg){border="0"}

After selecting an option the program will display a dialog box with default values for the engine (based on the cooling system, combustion system and whether it has forced induction or not) already filled in:

![](../Pictures/NewTemperature.jpg){border="0"}

The user can then accept these values as is if no better info is available or the values can be edited to represent more correct value for the engine being modeled.

## [Description of Variables]{.underline} {#description-of-variables align="left"}

### Inlet System Wall Temperature

This is the inlet duct system internal wall temperature and will be used for all the inlet ducts and boxes excluding the inlet ports. (Typically about **25** degrees Celsius)

### **Inlet Box Wall Temperature**

This is the inlet system airbox, plenums and charge air cooler header tank internal wall temperature and will be used for all the inlet plenums. (Typically about 25 degrees Celsius)

### Inlet Port Wall Temperature

This is the inlet port system internal wall temperature and will be used for all the inlet ports. (Typically about **150** degrees Celsius)

### Exhaust Port Wall Temperature

This is the exhaust port internal wall temperature and will be used for all the exhaust ports. (Typically about **250** degrees Celsius but it varies from engine to engine, especially between air and water cooled engines)

### **Exhaust Wall Temperature**

This is the inside surface temperature of the exhaust headers. On a multi-pipe system the collector and connector pipe wall temperatures are scaled inside the program. This value in conjunction with the simulation rpm and the maximum power rpm is also used to calculate the exhaust gas start-up temperature. (Typically **350 to 450** degrees Celsius)

### **Exhaust Box Wall Temperature**

This is the exhaust system box or plenums wall temperature and will be used for all the exhaust plenums. (Typically about 125 to 300 degrees Celsius)

### **Piston Crown Temperature**

This is the average surface temperature of the piston crown in centigrade. Typically a value of **250** degrees Celsius is used. This value in conjunction with the cylinder liner and combustion chamber surface temperature is used to calculate the heat flux from or into the cylinder.

### **Combustion Chamber (Cylinder Head) Wall Temperature**

This is the average temperature of the combustion chamber surface in centigrade. Typically a value of **280** degrees Celsius is used. This value in conjunction with the cylinder liner and piston crown surface temperature is used to calculate the heat flux from or into the cylinder.

### **Cylinder Liner Temperature**

This is the average surface temperature of the cylinder liner in centigrade. Typically a value of **220** degrees Celsius is used. This value in conjunction with the piston crown and combustion chamber surface temperature is used to calculate the heat flux from or into the cylinder.

## **[Atmospheric Conditions]{.underline}**

### **Atmospheric Temperature**

This is the atmospheric temperature at which the simulation is required to give the output predictions and is also the temperature used at the atmospheric inlet to the engine. The standard value is 20 degrees Celsius.

### **Atmospheric Pressure**

This is the atmospheric pressure at which the simulation is required to give the output predictions and is also the pressure used at the atmospheric inlet to the engine. The standard value is 101.325 kPa.

### **Outlet Atmospheric Temperature**

This is the temperature at the outlet(s) of the engine. Sometimes the engine outlet is not at atmospheric conditions and a different value from atmospheric conditions is required. If not, use the atmospheric value. The standard value is 20 degrees Celsius.

### **Outlet Atmospheric Pressure**

This is the pressure at the outlet(s) of the engine. Sometimes the engine outlet is not at atmospheric conditions and a different value from atmospheric conditions is required. If not, use the atmospheric value. The standard value is 101.325 kPa.

## [Simulation of Turbocharger or Supercharger]{.underline}

There is a facility to simulate a turbocharged or supercharged engine by specifying the boost pressure, back pressure and the related temperatures as atmospheric conditions to speed up the development of the engine before the much more complex and time consuming turbocharger model is added to the simulation model.

### Turbocharger simulated with same boosted inlet and outlet conditions, cold exhaust and no back pressure.

![](../Pictures/TemperatureSameBoostBackPressure.jpg){border="0"}

### Turbocharger simulated with different inlet and outlet conditions, hot exhaust and with back pressure.

![](../Pictures/TemperatureDeltaBoostBackPressure.jpg){border="0"}

### Supercharger simulated with boosted inlet and atmospheric outlet conditions and no back pressure.

![](../Pictures/TemperatureSuperBoostBackPressure.jpg){border="0"}

------------------------------------------------------------------------

© Neels van Niekerk 2024

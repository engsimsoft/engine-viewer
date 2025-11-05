## [Performance Output Data (\*.pou, \*.spo)]{.underline}

The performance data is written in a appending file. It has the project name with the **.pou** or **.spo** extension. As an example the name for the performance file of project Honda will be: **Honda.pou** for batch jobs and **Honda.spo** for screen runs. The data in the performance file is per column (where there is more than one cylinder the columns per cylinder are repeated for each cylinder):

- **RPM**         Simulated engine rpm
- **P-av**           Average engine power over the last three cycles (kW)
- **Torque**      The engine torque related to P-av.(Nm)
- **Tex-AvC**   Average temperature in center of exhaust (C)
- **Power**        Power per cylinder (kW)
- **Imep**           Indicated mean effective pressure per cylinder (bar)
- **Bmep**         Brake mean effective pressure per cylinder (bar)
- **Pmep**         Pumping mean effective pressure per cylinder (bar)
- **Fmep**          Friction mean effective pressure (bar)
- **Dratio**         Delivery ratio per cylinder
- **Purc **           Purity of the mixture in the cylinder at inlet valve closure
- **Seff **           Purity of the mixture in the cylinder at exhaust valve closure
- **Teff **           Trapping efficiency per cylinder
- **Ceff**            Charging efficiency per cylinder
- **BSFC**          Brake specific fuel consumption per cylinder (kg/kWh)
- **TC-av**         Average maximum cylinder temperature per cylinder (C)
- **TUBmax**    Maximum unburned mixture temperature per cylinder (C)
- **MaxDeg**     Degrees after TDC where maximum cylinder pressure occurs per cylinder
- **Timing**        Ignition timing (BTDC)
- **Delay**          The user prescribed delay period in degrees (deg)
- **Durat**          The user prescribed combustion duration (burn period) in degrees (deg)
- **TAF**            Trapped Air/fuel ratio
- **VibeDelay**  The calculated delay period for a turbulent combustion model (for the prescribed combustion model it is the same as **\"Delay\"**)
- **VibeDurat**  The calculated burn period for a turbulent combustion model (for the prescribed combustion model it is the same as **\"Durat\"**)
- **VibeA**        The calculated Vibe A value for a turbulent combustion model (for the prescribed combustion model it is the same as prescribed)
- **VibeM**       The calculated Vibe M value for a turbulent combustion model (for the prescribed combustion model it is the same as prescribed)

If the engine is turbocharged the following values are included:

- **Boost**          The simulated boost pressure (bar guage) at the specified boost point
- **BackPr**       The simulated back pressure (bar guage)
- **Pratio**         The ratio between the boost pressure and the back pressure.
- **TBoost**       The simulated inlet temperature (C) at the specified boost point
- **TTurbine**   The simulated turbine inlet temperature (C)

If the engine is supercharged the following values are included:

- **Boost**          The simulated boost pressure (bar guage) at the specified boost point
- **BackPr**       The simulated back pressure (bar guage)
- **Pratio**         The ratio between the boost pressure and the back pressure.
- **TBoost**       The simulated inlet temperature (C) at the specified boost point

The units are standard SI units: kg, s, Nm, kW etc.

 

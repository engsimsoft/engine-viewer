## [Performance Output Data (\*.pou, \*.spo)]{.underline}

The performance data is written in an appending file. It has the project
name with the **.pou** or **.spo** extension. As an example the name for
the performance file of project Honda will be: **Honda.pou** for batch
jobs and **Honda.spo** for screen runs. The data in the performance file
is per column (where there is more than one cylinder the columns per
cylinder are repeated for each cylinder):

- **RPM**         Simulated engine rpm
- **P-av**
  - Average engine total power over the last six cycles (kW) for a
    naturally aspirated engine.
  - The same for a Supercharged engine but with the power absorbed by
    the Compressor and its drive subtracted.
  - Average engine total power over the last forty cycles (kW) for a
    Turbocharged engine.
- **Torque**      The engine torque calculated from the P-av value in
  the previous bullet point.(Nm)
- **Tex-AvC**   Average temperature in center of exhaust (C)
- **Power**        Power per cylinder (kW)
- **Imep**           Indicated mean effective pressure per cylinder
  (bar)
- **Bmep**         Brake mean effective pressure per cylinder (bar)
- **Pmep**         Pumping mean effective pressure per cylinder (bar)
- **Fmep**          Friction mean effective pressure (bar)
- **Dratio**         Delivery ratio per cylinder
- **Purc **           Purity of the mixture in the cylinder at inlet
  valve closure
- **Seff **           Purity of the mixture in the cylinder at exhaust
  valve closure
- **Teff **           Trapping efficiency per cylinder
- **Ceff**            Charging efficiency per cylinder
- **BSFC**          Brake specific fuel consumption per cylinder
  (kg/kWh)
- **TC-av**         Average maximum cylinder temperature per cylinder
  (C)
- **TUBmax**    Maximum unburned mixture temperature per cylinder (C)
- **MaxDeg**     Degrees after TDC where maximum cylinder pressure
  occurs per cylinder
- **Timing**        Ignition timing (BTDC)
- **Delay**          The user prescribed delay period in degrees (deg)
- **Durat**          The user prescribed combustion duration (burn
  period) in degrees (deg)
- **TAF**            Trapped Air/fuel ratio
- **VibeDelay**  The calculated delay period for a turbulent combustion
  model (for the prescribed combustion model it is the same as
  **\"Delay\"**)
- **VibeDurat**  The calculated burn period for a turbulent combustion
  model (for the prescribed combustion model it is the same as
  **\"Durat\"**)
- **VibeA**        The calculated Vibe A value for a turbulent
  combustion model (for the prescribed combustion model it is the same
  as prescribed)
- **VibeM**       The calculated Vibe M value for a turbulent combustion
  model (for the prescribed combustion model it is the same as
  prescribed)

If the engine is **Turbocharged** the following values are included:

- **Boost**          The simulated boost pressure (bar guage) at the
  specified boost point
- **BackPr**       The simulated back pressure (bar guage)
- **Pratio**         The ratio between the boost pressure and the back
  pressure.
- **TBoost**       The simulated inlet temperature (C) at the specified
  boost point
- **TTurbine**   The simulated turbine inlet temperature (C)
- **RPMturb**    The Turbocharger RPM.
- **WastRat**      The open ratio of the Waste Gate if one is fitted.

If the engine is **Supercharged** the following values are included:

- **Boost**          The simulated boost pressure (bar guage) at the
  specified boost point
- **BackPr**       The simulated back pressure (bar guage)
- **Pratio**         The ratio between the boost pressure and the back
  pressure.
- **TBoost**        The simulated inlet temperature (C) at the specified
  boost point
- **RPMsup**     The Supercharger RPM.
- **PowSup**       The total power absorbed (kW) by driving the
  supercharger compressor.
- **BOVrat**       The open ratio of the Blow Off Valve if one is
  fitted.

The units are standard SI units: kg, s, Nm, kW etc.

## [Detailed Description of each Output]{.underline}

### 1. RPM - Simulated engine rpm

This is the rpm value for which the following results were obtained:

- If a batch run was conducted these results (as stored in the .pou
  file) will form a power curve that can be displayed using Post2T.
- If single point runs were conducted these results (as stored in the
  .spo file) are just data and the file can be opened with any text
  editor and the results examined.

### 2. P-av - Average engine power over a number of engine cycles (kW)

Because of the cyclic variability of an engine, the power is averaged
over a number of cycles:

- Average engine total power over the last three cycles for a naturally
  aspirated engine.
- The same for a Supercharged engine but with the power absorbed by the
  Compressor and its drive subtracted.
- Average engine total power over the last forty cycles for a
  Turbocharged engine.

### 3. Torque - The engine torque related to P-av.(Nm)

This torque value is the torque calculated from the averaged power is
described in point 2 and is thus the averaged torque over the last 3
cycles.

### 4. Tex-AvT - Average temperature at transducer position in exhaust header (C)

This is the average bulk temperature of the gas at the trace position
defined for the cylinder and its position is measured from the piston.
This is the value used to tune engines using an EGT guage.

### 5. Power - Power per cylinder (kW)

This is the power produced by each cylinder over the last cycle. On a
single cylinder engine comparing this value to the one averaged over 3
cycles (P-av) gives an indication of the cyclic variability.

### 6. IMEP - Indicated mean effective pressure per cylinder (bar)

This is the averaged pressure value in the cylinder over a simulation
cycle and is an indication of the maximum power the engine can make if
there was no pumping or friction losses.

### 7. BMEP - Brake mean effective pressure per cylinder (bar)

This is the averaged cylinder pressure calculated from the netto power
as measured on an engine dyno (or an egine simulation such as this) and
takes the frictional and pumping losses into account. Comparing the BMEP
with the IMEP gives a good indication of the mechanical and pumping
efficiencies. A more efficient engine will have a smaller difference.

### 8. PMEP - Pumping mean effective pressure per cylinder (bar)

This is the average pumping work done in the cylinder and crankcase
expressed as an average pressure.

### 9. FMEP - Friction mean effective pressure (bar)

This is the frictional and other parasitic losses in the engine
expressed as an average pressure.

### 10. Dratio - Delivery ratio per cylinder

The delivery ratio of the engine defines the mass of air supplied during
the scavenge period as a function of the reference mass which is the
mass required to fill the swept volume under the atmospheric conditions.

### 11. Purc - Purity of the mixture in the cylinder at inlet valve closure

The purity is defined as the ratio of the air trapped at inlet valve
closure to the total mass of the cylinder charge.

### 12. Seff - Purity of the mixture in the cylinder at exhaust valve closure

The scavenging efficiency defines the effectiveness of the scavenging
process during the overlap period.

### 13. Teff - Trapping efficiency per cylinder

The trapping efficiency is the ratio of the delivered air that has been
trapped to the total amount of delivered air.

### 14. Ceff - Charging efficiency per cylinder

Charging efficiency expresses the ratio of actually filling the cylinder
with air by comparison with filling the same cylinder perfectly with
air.

### 15. BSFC - Brake specific fuel consumption per cylinder (kg/kWh)

This is the ratio of the fuel consumption rate to the power produced by
that fuel.

### 16. TC-av - Average maximum cylinder temperature per cylinder (C)

The maximum cylinder temperature averaged over the number of cylinders.
This is the value that is calculated from the cylinder pressure and is
somewhere between the burnt and unburnt zone temperatures.

### 17. TUBmax - Maximum unburned mixture temperature per cylinder (C)

This is the highest temperature the gas in the unburnt zone reaches
without being part of the burnt zone. This temperature is one of the
strongest indicators of whether detonation will occur or not.

### 18. MaxDeg - Degrees after TDC where maximum cylinder pressure occurs per cylinder

For maximum power it is typical to set the ignition timing to have
maximum cylinder pressure to occur around 8-12 ATDC.

### 19. Timing - Ignition timing (BTDC)

This is the number of degrees before (or after) TDC where the actual
spark happens for a spark ignition engine and the start of injection for
a compression ignition engine.

### 20. Delay - The user prescribed delay period in degrees (deg)

The period from spark or injection to about 1% mass fraction burned. The
flame kernel in this part is primarily grown through laminar burning.

### 21. Durat - The user prescribed combustion duration (burn period) in degrees (deg)

This is the period from the end of the delay period until about 99.9% of
the mixture has been burned.

### 22. TAF - Trapped Air/fuel ratio

This is the prescribed air/fuel ratio as specified in the combustion
subsystem.

To see how the following Vibe values can be used see [Vibe Combustion
File](../Contents/VibeCombustionFile.htm)

### 23. VibeDelay

The calculated delay period for a turbulent combustion model (for the
prescribed combustion model it is the same as \"Delay\")

### 24. VibeDurat

The calculated burn period for a turbulent combustion model (for the
prescribed combustion model it is the same as \"Durat\")

### 25. VibeA

The calculated Vibe A value for a turbulent combustion model (for the
prescribed combustion model it is the same as prescribed)

### 26. VibeM

The calculated Vibe M value for a turbulent combustion model (for the
prescribed combustion model it is the same as prescribed)

 

# Efficiency Parameters

## How to use the Efficiency Parameters to understand the Simulation results

There are five \"efficiencies\" or \"purities\" reported in the EngMod4T power output file. These values can be used to understand how well an engine breaths, scavenges and plugs or sucks the exhaust port during overlap and how well the cylinder is filled during the induction process. There are subtle differences between some of them that plays a big role in our understanding of the whole open cycle process in a four-stroke engine. They are described in the following paragraphs:

**1. Delivery Ratio - (DRatio):** Delivery ratio is the total mass of air inhaled by the engine compared to the mass of air in the swept volume of the engine at atmospheric conditions. This is an indication of how good an engine \"breaths\". In the four-stroke world they use the term \"Volumetric Efficiency\" to describe this but it is misleading as it is a mass ratio and not a volume ratio. An industrial engine typically have a delivery ratio of between 0.6 and 0.8 while a very high performance racing engine can have values as high as 1.25.

**2. Scavenging Efficiency - (Seff):** Scavenging efficiency is how pure the gas inside the cylinder is **at the time the exhaust valve closes** which differs from the traditional definition that defines it at the time of inlet valve closure. It describes the purity in the cylinder at the end of the overlap period. Depending on where in the rpm range you are and whether the inlet and / or exhaust is in or out of tune the value can vary from 0 to 1.0. If, during the period where both the in- and oulet systems are in tune and the value is not quite high, it points to an issue with the flow during overlap and the inlet and exhaust pressure and mass flow traces should be examined.

**3. Cylinder Purity - (PurCyl):** The cylinder purity is defined as the purity of the mixture at inlet valve closure. It is a function of the amount of gas that flowed during the induction stroke and how good the scavenging efficiency was at exhaust valve closure. For all practical purposes the burnt gas left in the cylinder at exhaust valve closure will be trapped in the cylinder until combustion is completed and the exhaust valve opens.

**4. Trapping Efficiency - (Teff):** Trapping efficiency is an indicator of how much of the air delivered (delivery ratio) is trapped in the cylinder at inlet valve closure. It gives a very clear indication of how well the plugging part of the inlet system works.

**5. Charging Efficiency - (Ceff):** Charging efficiency is the ratio between the mass of the trapped charge at inlet valve closure and the mass of charge the cylinder can hold at atmospheric conditions and the piston at BDC. The Ceff curve is the same shape as the torque curve and it is directly related to the performance of the engine.

------------------------------------------------------------------------

\(C\) Vannik Developments 2020

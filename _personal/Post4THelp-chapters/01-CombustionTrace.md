## [Combustion Trace Output (\*.cbt)]{.underline}

The combustion trace files are part of the new or over written files.
They have the project name appended with the rpm value and the extension
**.cbt**. The combustion traces for project Honda at 8000 rpm will be in
the file: **Honda8000.cbt**. This file will be in the project directory
and over written each time a simulation at its specific rpm is
conducted.

It has the following traces as output:

- **Deg **            Engine degrees using the last cylinder as
  reference.
- **HPistTDC**  The piston height from the top of the cylinder per
  cylinder.
- **Torque**       The instantanious torque produced or absorbed by the
  cylinder per cylinder.
- **VSqshAc**    The actual squish velocity in the cylinder per cylinder
  taking density and combustion into account.
- **VSqshTh**    The theoretical squish velocity in the cylinder per
  cylinder ignoring density and combustion effects.
- **Mun **           The unburnt air mass ratio in the cylinder per
  cylinder.
- **Men **           The entrained air mass ratio in the cylinder per
  cylinder (the mass ratio of air, but not all burnt yet, inside the
  flame sphere).
- **Mbt **            The burnt air mass ratio in the cylinder per
  cylinder.
- **TurbInt**       The turbulent intensity in the cylinder per
  cylinder.
- **TurbDis**      The turbulent disipation in the cylinder per
  cylinder.
- **Integral**       The integral length scale in the cylinder per
  cylinder.
- **Taylor **        The Taylor length scale in the cylinder per
  cylinder.
- **RFlame**       The radius of the flame sphere in the cylinder per
  cylinder.
- **AFlame**       The flame area of the flame sphere in the cylinder
  per cylinder.
- **VFlame**       The volume of the flame sphere in the cylinder per
  cylinder.
- **RBurnt**        The radius of the burnt sphere in the cylinder per
  cylinder.
- **ABurnt**        The flame area of the burnt sphere in the cylinder
  per cylinder.
- **VBurnt**        The volume of the burnt sphere in the cylinder per
  cylinder.
- **AWallU**       The area of the exposed wall in the unburnt portion
  of the cylinder per cylinder.
- **AWallB**       The area of the exposed wall in the burnt portion of
  the cylinder per cylinder.
- **RoHR**          The rate of heat release per cylinder.
- **Work**           The work done by each cylinder.
- **MCyl**           The mass of the gas inside each cylinder.
- **MUCyl**         The mass of the unburnt gas inside each cylinder.
- **MBCyl**         The mass of the burnt gas inside each cylinder.

The combustion trace file is mostly used for debugging and understanding
of the combustion process. Using the prescribed burn rate model (Wiebe
or Vibe function) will result in the entrained mass and the burnt mass
having the same ratio.

To load combustion traces the following radio button is selected:

![](01-Pictures/RadioCombTrace.jpg){border="0"}

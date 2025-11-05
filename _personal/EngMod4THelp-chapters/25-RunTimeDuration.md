# Run Time Duration

One of the major factors controlling the time a simulation takes (on any simulator) is the number of meshes or control volumes the ducts are divided into. Now we also have to take into consideration that for accuracy sake we want the wave to travel about one mesh length or slightly less per revolution. If it is more we have a numerically unstable situation and the software crashes (we are trying to extrapolate). If it travels a lot less than the mesh length we loose resolution and start getting smearing. So what the software does at each rpm point is it uses an assumed pipe temperature, calculate the wave speed and then calculate a mesh length that will give an increment about every one degree. We now have to verify that this increment length will result in a minimum of three meshes in the shortest pipe - for the numerical method to work you need a minimum of three meshes. So now the software checks all the pipes/ducts and if one is found with less than 3 meshes the mesh length is decreased until three meshes fits. At the end of this we have the final mesh length and if this is much shorter than what we started with we will end up with lots more meshes and the degree increment will be smaller as well. So we end up getting penalised twice for very short pipes, more meshes to calculate for and more increments per revolution.

To minimize the run time the solution is to increase the length of the shortest duct/pipe to minimize this effect. The aim is to have no duct shorter than the minimum length for the lowest rpm point to be simulated as listed in the following table but this requires us find a trade off between run time and accuracy. The best solution is to lengthen the shortest duct/pipe to this minimum length for an exhaust pipe/duct and for an inlet pipe/duct and to subtract this correction from a mating duct/pipe to maintain the correct overall length.

The following table gives an indication what the minimum inlet and exhaust lengths should be for the minimum simulation rpm to not effect the run time negatively. Shorter lengths can be used but it will increase the run time.

  ------- -- --------- -------
  RPM        Exhaust   Inlet
  6000       72mm      36mm
  8000       54mm      27mm
  10000      43mm      22mm
  12000      36mm      18mm
  14000      31mm      15mm
  16000      27mm      13mm
  18000      24mm      12mm
  ------- -- --------- -------

Please note the following:

- In an effort to ensure accuracy below 6000 rpm the minimum length stays as specified for 6000 rpm. This will lead to longer run times below 6000rpm.
- If a silencer is used the way it is modeled internally will result in very short ducts which will dramatically increase the run times.
- A turbocharger simulation requires over a 100 iterations for the turbocharger model to stabilize.
- The pipe joint subroutine (collector) is not an efficient piece of software and more collectors lead to slower run times.

The following example illustrates what we are trying to achieve:

[![](25-Pictures/ShortestPipeLength.bmp){border="0" width="349" height="353"}]{lang="EN-US"}

In this example, for a total length of 120mm the unmodified version would be divided into 12 meshes while the modified one will be 8 meshes, leading to approximately a 30% reduction reduction in run time.

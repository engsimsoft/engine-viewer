## [General Discussion of Output Data]{.underline}

[EngMod4T writes its output data to a selection of files in the project folder. There are two types of output files: ]{lang="EN-UK" style="font-size:12.0pt"}

1.  Appended output files
2.  New or over written files.

The appended file is the file that summarizes the performance values like power, mean effective pressures etc. These files have the names:

- Projectname.pou which is known as the power curve output file,
- Projectname.spo which is known as the single point power output file.

The new or over written files has the pressure traces, temperature traces etc. for each rpm point simulated. These files has the following naming convension: ProjectnameRPM.ext. For example the temperature traces for a project \'Honda\' at 8000rpm will have the following name: Honda8000.tpt. If these files do not exist, new ones are created and if they do exist from a previous run, they are over written with the data from the new run. If for any reason you would like to keep an older run you will have to manually rename them.

The trace files uses crank angle as reference and specifically the crank angle of the last cylinder. This means that the traces for the final cylinder (or the only cylinder for a single cylinder engine) are the only ones starting at TDC.

These files can be displayed using the post processor Post4T. A general program like Microsoft Excel can also be used for this. Import the files as \'space delimited\' text files and start importing at line 16. The information before line 16 is for use by the post processor.

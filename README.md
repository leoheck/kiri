# Kicad Revision Inspector (KiRI)

KiRI is small tool to experiment having a visual diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsch](https://github.com/jnavila/plotkicadsch) to generate schematic diffs.

It currently supports `Kicad 5.*` projects that use Git as source management. The `Kicad 6.*` support is stil limited to layout since there is no way to export svg images from the schematics for the new `.kicad_sch` file format.

Previously known as KDiff, it was renamed KiRI since the old name was pretty close to the KiDiff or Kicad-Diff, one of the projects referred to above.

## Installing

To install this tool with on any Operating System (Windows, macOS, and debian-based Linux), open a terminal and execute the following commands:

> Windows users must use WSL/WSL2. See, [Environment preparation on Windows](#Environment-preparation-on-Windows) section.


```bash
# Installing dependencies
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_dependencies.sh)"
```

```bash
# Installing KiRI and Kicad Plugin
# The default installation path is "${HOME}/.local/share" it can be changed
# with the KIRI_INSTALL_PATH environment variable.
# Example: export KIRI_INSTALL_PATH=/home/$USER/Documents/
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_kiri.sh)"
```

### Environment preparation on Windows

[Configure WSL](https://www.tenforums.com/tutorials/46769-enable-disable-windows-subsystem-linux-wsl-windows-10-a.html)

On a Powershell terminal with admin right, execute the following commands:

```powershell
# Enable Windows Subsystem for Linux (using Power Shell)
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
#Install-WindowsFeature -Name Microsoft-Windows-Subsystem-Linux

# Install Ubuntu 20.04
Invoke-WebRequest -Uri https://aka.ms/wsl-ubuntu-2004 -OutFile ~/Downloads/ubuntu-2004.zip
New-Item -Path C:\ubuntu-2004 -ItemType Directory
Expand-Archive -Path ~/Downloads/ubuntu-2004.zip C:\ubuntu-2004
Set-Location C:\ubuntu-2004
& .\ubuntu2004.exe
```

After, install dependencies and Kiri by running script in the [Installing](#Installing) section

## Loading KiRI environment

Setup the environment using the following commands.

> Make sure `KIRI_HOME` is the right path to the installation folder

```
# Kiri environment setup
eval $(opam env)
export KIRI_HOME=${HOME}/.local/share/kiri
export PATH=${KIRI_HOME}/submodules/KiCad-Diff/:${PATH}
export PATH=${KIRI_HOME}/bin:${PATH}
```


# Using KiRI
```
cd [kicad_git_repo]
kiri board.pro
```

## Command line flags (aka Help)

Command line flags can be seen using the `-h` flag
```
kiri -h
```

# Kicad/PCBNew integration

It is possible to integrate KiRI on PCBNew adding a button to the toolbar

```bash
# Create folder if it does not exist
mkdir -p ~/.kicad/scripting/plugins

# Copy the plugin there
cd kiri
cp -r kicad_plugin ~/.kicad/scripting/plugins/kiri
```

# Archiving generated files

There is a possibility to archive generated files. to visualize generated files, unpack the folder anywhere and execute the webserver inside of the folder, as shown below:

```
tar -xvzf kiri-2021.11.18-16h39.tgz
cd kiri
./kiri-webserver.py .
```

# Examples

Schematic view, assets generated using Plotkicadsch

<p align="center">
    <img src="misc/kiri_sch.png" width="820" alt="Schematic View">
</p>

Layout view, assets generated using Kicad-Diff

<p align="center">
    <img src="misc/kiri_pcb.png" width="820" alt="Layout View">
</p>

Demo on Youtube (old version)

<p align="center">
<a href="http://www.youtube.com/watch?v=PMC0USSsbDE" target="_blank">
    <img src="https://img.youtube.com/vi/PMC0USSsbDE/maxresdefault.jpg" alt="Kicad Revision Inspector Demo" width="820">
</a>
</p>

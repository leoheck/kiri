# Kicad Revision Inspector (KiRI)

KiRI is small tool to experiment having a visual diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsch](https://github.com/jnavila/plotkicadsch) or [xdotool](https://github.com/jordansissel/xdotool)/[cliclick](https://github.com/BlueM/cliclick) to generate schematic diffs.

It currently supports projects of `Kicad 5.*` and `Kicad 6.*` using `git` for source management.

Schematics on `Kicad 6` are handled graphically by [xdotool](https://github.com/jordansissel/xdotool) on Linux/Windows and by [cliclick](https://github.com/BlueM/cliclick) on macOS.

## Installing

To install this tool with on any Operating System, open a terminal and execute the following commands:

> Windows users must use WSL/WSL2. See, [Environment preparation on Windows](#Environment-preparation-on-Windows) section.

> macOS users must have `homebrew` installed 

```bash
# Installing dependencies
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_dependencies.sh)"
```

```bash
# Installing KiRI and Kicad Plugin
# The default installation path is "${HOME}/.local/share" it can be changed
# with the KIRI_INSTALL_PATH environment variable.
# Example: export KIRI_INSTALL_PATH=/home/$USER/Documents/
bash -c "INSTALL_KIRI_REMOTELLY=1; $(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_kiri.sh)"
```

> xdotool, used to plot schematics of Kicad 6 (.kicad_sch) requires a X Window System Server. Some of the alternatives include [Xming](https://sourceforge.net/projects/xming/), [Cygwin](https://x.cygwin.com/), and [Mobaterm](https://mobaxterm.mobatek.net/).

### Environment preparation on Windows

[Configure WSL](https://www.tenforums.com/tutorials/46769-enable-disable-windows-subsystem-linux-wsl-windows-10-a.html)

For `WSL1`, on a Powershell terminal with admin right, execute the following commands:

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

For `WSL2`, on a Powershell terminal with admin right, execute the following commands:
```powershell
wsl --set-default-version 2
wsl --install -d ubuntu
```

After, install dependencies and Kiri by running script in the [Installing](#Installing) section

## Loading KiRI environment

Setup the environment using the following commands.

> Make sure `KIRI_HOME` is the right path to the installation folder

```bash
# Kiri environment setup
eval $(opam env)
export KIRI_HOME=${HOME}/.local/share/kiri
export PATH=${KIRI_HOME}/submodules/KiCad-Diff/:${PATH}
export PATH=${KIRI_HOME}/bin:${PATH}
```


# Using KiRI
```bash
cd [kicad_git_repo]
kiri board.pro
```

## Command line flags (aka Help)

Command line flags can be seen using the `-h` flag
```bash
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

```bash
tar -xvzf kiri-2021.11.18-16h39.tgz
cd kiri
./kiri-webserver.py .
```

# Limitations

Current known limitations of Kiri is schematic pages. It supports hierarchical pages in the first page but it does not support nested hierarchical pages.
Schematic pages inside a separated folder are also accepted if they nested pages are not in use.


# Examples

Schematic view, assets generated using Plotkicadsch

<p align="center">
    <img src="misc/kiri_sch.png" width="820" alt="Schematic View">
</p>

Layout view, assets generated using Kicad-Diff

<p align="center">
    <img src="misc/kiri_pcb.png" width="820" alt="Layout View">
</p>

Comparing the new `.kicad_sch` file with an old `.sch`

<p align="center">
    <img src="misc/kicad_sch_v6.png" width="820" alt="Layout View">
</p>

Demo on Youtube

<p align="center">
<a href="https://youtu.be/zpssGsvCgi0" target="_blank">
    <img src="https://img.youtube.com/vi/zpssGsvCgi0/maxresdefault.jpg" alt="Kicad Revision Inspector Demo" width="820">
</a>
</p>

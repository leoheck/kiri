# Kicad Revision Inspector (KiRI)

KiRI is small tool to experiment having a visual diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsch](https://github.com/jnavila/plotkicadsch) or [xdotool](https://github.com/jordansissel/xdotool)/[cliclick](https://github.com/BlueM/cliclick) to generate schematic diffs.

It currently supports projects of `Kicad 5`, `Kicad 6` and `Kicad 7` using `git` for source management.

If `Kicad 7` is available, schematics of projects created with Kicad 6 and Kicad 7 are plotted using the new `kicad-cli`.

If only `Kicad 6` is available, schematics are handled graphically by [xdotool](https://github.com/jordansissel/xdotool) on Linux/Windows and by [cliclick](https://github.com/BlueM/cliclick) on macOS.

For `Kicad 5` projects, schematics are generated with Plotgitsch.

Cliclick on macOS needs `System Preferences → Security & Privacy → Accessibility` for Terminal enabled.

Kicad-Diff is used to plot layouts of all versions of the Kicad (even if Kicad 7 is installed since it is much faster than kicad-cli).

## Installing

To install this tool with on any Operating System, open a terminal and execute the following commands:

> Windows users must use WSL/WSL2. See, [Environment preparation on Windows](#Environment-preparation-on-Windows) section.

> macOS users must have `homebrew` installed

Installing (and Reinstalling) dependencies
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_dependencies.sh)"
```

Installing (and Reinstalling) KiRI
```bash
# The default installation path is "${HOME}/.local/share"
# It can be changed which the KIRI_INSTALL_PATH environment variable:
export KIRI_INSTALL_PATH=${HOME}/.local/share

# To test a different branch of Kiri, use the following environment variable:
export KIRI_BRANCH=main
```

```bash
bash -c "INSTALL_KIRI_REMOTELLY=1; \
    $(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_kiri.sh)"
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
export PATH=${KIRI_HOME}/submodules/KiCad-Diff/bin:${PATH}
export PATH=${KIRI_HOME}/bin:${PATH}
```

On Windows/WSL, it is needed to launch the XServer (e.g `Xming`) and also have the `DISPLAY` set correctly
Add the following lines in the end of the `~/.bashrc`, `~/.zshrc` to set DISPLAY.
Also, launch `kicad` manually or any other GUI tool like `xeyes` to test if X11 is working.

```bash
# Set DISPLAY to use X terminal in WSL
# In WSL2 the localhost and network interfaces are not the same than windows
if grep -q "WSL2" /proc/version &> /dev/null; then
    # execute route.exe in the windows to determine its IP address
    export DISPLAY=$(route.exe print | grep 0.0.0.0 | head -1 | awk '{print $4}'):0.0

else
    # In WSL1 the DISPLAY can be the localhost address
    if grep -qi "Microsoft" /proc/version &> /dev/null; then
        export DISPLAY=127.0.0.1:0.0
    fi

fi
```

# Docker

Since Kiri involves a lot of tools and complex settings there is a project that aims to use Docker to provide simple usage. This is a separate project and can be found here [Kiri-Docker](https://github.com/leoheck/kiri-docker)

# Using KiRI

It can be launched by running Kiri inside or out of the project's repository.

```bash
cd [kicad_git_repo]
kiri
```

Alternatively, it is possible to pass the filename

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
./kiri-server .
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

Comparing the new `.kicad_sch` file with an old `.sch`

<p align="center">
    <img src="misc/kicad_sch_v6.png" width="820" alt="Layout View">
</p>

Demo on YouTube

<p align="center">
<a href="https://youtu.be/zpssGsvCgi0" target="_blank">
    <img src="https://img.youtube.com/vi/zpssGsvCgi0/maxresdefault.jpg" alt="Kicad Revision Inspector Demo" width="820">
</a>
</p>


# Installing KiRI Dependencies

To install this tool on any Operating System, open a terminal and execute the following commands:

> Windows users must use WSL/WSL2. See, [Windows preparation](#Windows-preparation) section.

> MacOS users must have `homebrew`. See, [MacOS preparation](#MacOS-preparation) section for extra details.

Installing (and reinstalling) dependencies:
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_dependencies.sh)"
```

## Windows Preparation

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

Also, if Kicad 6 is installed, `xdotool` is used to plot schematics (`.kicad_sch`) and it requires a X Window System Server. Some of the alternatives include [Xming](https://sourceforge.net/projects/xming/), [Cygwin](https://x.cygwin.com/), and [Mobaterm](https://mobaxterm.mobatek.net/).

## MacOS Preparation

After installing dependencies on macOS, if Kicad 6 is installed, it uses `cliclick` to plot schematics which needs `System Preferences → Security & Privacy → Accessibility` enabled for the Terminal.

# Installing KiRI

Installing (and reinstalling) KiRI:
```bash
# Install KiRI
bash -c "INSTALL_KIRI_REMOTELLY=1; \
    $(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_kiri.sh)"
```

The follwoing variables can be used to change the installation path and KiRI's branch, if needed.

```bash
# The default installation path is "${HOME}/.local/share"
# It can be changed which the KIRI_INSTALL_PATH environment variable:
export KIRI_INSTALL_PATH=${HOME}/.local/share

# To test a different branch of Kiri, use the following environment variable:
export KIRI_BRANCH=main
```

# Post-Installation

Setup the environment using following commands.

> Make sure `KIRI_HOME` is the right path to the installation folder

```bash
# KiRI Environment
eval $(opam env)
export KIRI_HOME=${HOME}/.local/share/kiri
export PATH=${KIRI_HOME}/submodules/KiCad-Diff/bin:${PATH}
export PATH=${KIRI_HOME}/bin:${PATH}
```

On Windows/WSL, it is needed to launch the XServer (e.g `Xming`) and also have the `DISPLAY` set correctly.
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

Since KiRI involves a bunch of tools and some complex settings, there is a repo that shares a Docker image to provide simple use. This is a separate project and can be found here [Kiri-Docker](https://github.com/leoheck/kiri-docker)

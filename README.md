# Kicad Revision Inspector (KiRI)

KiRI is small tool to experiment having a visual diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsch](https://github.com/jnavila/plotkicadsch) to generate schematic diffs.

It currently supports Kicad 5.* projects that use Git as source management.

Previously known as KDiff, it was renamed KiRI since the old name was pretty close to the KiDiff or Kicad-Diff, one of the projects referred to above.

## Installing dependencies

To install dependencies with a single command on any Operating System, open a terminal and execute:
Windows users must use WSL/WSL2.

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_dependencies.sh)"

```

## Environment preparation on Windows
[Configure WSL](https://www.tenforums.com/tutorials/46769-enable-disable-windows-subsystem-linux-wsl-windows-10-a.html)

```batch
# Enable Windows Subsystem for Linux (using Power Shell)
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
#Install-WindowsFeature -Name Microsoft-Windows-Subsystem-Linux

# Install Ubuntu 20.04
Invoke-WebRequest -Uri https://aka.ms/wsl-ubuntu-2004 -OutFile ~/Downloads/ubuntu-2004.zip
New-Item -Path C:\ubuntu-2004 -ItemType Directory
Expand-Archive -Path ~/Downloads/ubuntu-2004.zip C:\ubuntu-2004
Set-Location C:\ubuntu-2004
& .\ubuntu1804.exe
```

And then continue with the instructions in "Installing dependencies on Linux" inside the WSL (Ubuntu terminal).


## Installing dependencies on Linux/WSL

```bash
# Basic dependencies for Linux/WSL
sudo apt install -y libgmp-dev
sudo apt install -y pkg-config
sudo apt install -y opam
sudo apt install -y python3-pip
sudo apt install -y python3-tk
sudo apt install -y kicad
sudo apt install -y dos2unix
sudo apt install -y coreutils
sudo apt install -y zenity

# Initialize opam
opam init --disable-sandboxing --reinit
opam switch create 4.09.1
opam switch 4.09.1
eval $(opam env)

# Kicad-Diff dependencies
pip3 install pygubu
pip3 install python_dateutil
pip3 install tk
```

Zenity is optional. Windows users will need to have installed an X Server like [XMing](https://sourceforge.net/projects/xming/) to be able to run it with Zenity.

## Installing dependencies on OSX

```bash
# Download and Install Kicad for OSX - https://www.kicad.org/download/macos/
sudo spctl --master-disable

# Opam dependencies
brew install gmp
brew install pkg-config
brew install opam

# KiRI dependencies
brew install gsed
brew install findutils
brew install dos2unix
brew install coreutils

# Initialize opam
opam init --disable-sandboxing --reinit
opam switch create 4.09.1
opam switch 4.09.1
eval $(opam env)

# Plotgitsch dependencies
opam install lwt_ppx
opam install cmdliner
opam install base64
opam install sha
opam install tyxml
opam install git-unix

# Kicad-Diff dependencies
pip3 install pygubu
pip3 install python_dateutil
pip3 install tk
```

After installing dependencies continue with [the next section](https://github.com/leoheck/kiri#Installing-Submodules)

## Installing Submodules

This tool uses submodules for Plotgitsch and Kicad-Diff to guarantee these tools are in a version that work. Feel free to override these with other versions of them.

```bash
# Clone kiri repo
git clone https://github.com/leoheck/kiri
git submodule update --init --recursive

# Install plotgitsch
cd kiri/submodules/plotkicadsch
./install.sh

# Load KiCad-Diff environment
cd ../KiCad-Diff
source ./env.sh

# Load kiri environment
cd ../../
source ./env.sh
```

# Using KiRI
```
cd [kicad_git_repo]
kiri board.pro
```

## Command line flags (aka Help)

How to access tool help, this may change, so prefer to use `kiri -h` instead.

```
➜ kiri -h

USAGE :

    kiri [OPTIONS] [KICAD_PROJECT]

OPTIONS:

    -a|--all           Include all commits even if schematics/layout don't have changes
    -o|--older HASH    Show commits starting from this one
    -n|--newer HASH    Show commits until this one delimited by this one
    -r|--remove        Remove cache (kidiff) folder before run
    -l|--webserver    Do not launch webserver/browser at the end
    -p|--port PORT     Set webserver port
    -V|--verbose       Verbose
    -v|--version       Show version
    -D|--debug         Extra info
    -dp|--debug-plotgitsch
                       Show Plotgitsch stdout and stderr
    -dk|--debug-kidiff Show Kidiff stdout and stderr
    -h|--help          This help

KICAD_PROJECT:

    KICAD_PROJECT file is optional.
    If it is missing then file selector in GUI is used instead

EXAMPLES:

    # Launch GUI with file selector
    kiri

    # Kicad project on the root of the repo
    kiri board.pro

    # Nested project (with verbose and starting fresh)
    kiri nested-project/board.pro -r -V

```

# (EXTRA) Kicad integration

It is also possible to integrate kiri in PCBNew toolbar

```bash
# Create folder if it does not exist
mkdir -p ~/.kicad/scripting/plugins

# Copy the plugin there
cd kiri
cp -r kicad_plugin ~/.kicad/scripting/plugins/kiri
```

# Examples

Schematic view, assets generated using Plotkicadsch

<p align="center">
	<img src="misc/kiri_sch.png" width="820" alt="sch">
</p>

Layout view, assets generated using Kicad-Diff

<p align="center">
	<img src="misc/kiri_pcb.png" width="820" alt="pcb">
</p>

Demo on Youtube (old version)

<a href="http://www.youtube.com/watch?v=PMC0USSsbDE" target="_blank">
    <img src="https://img.youtube.com/vi/PMC0USSsbDE/maxresdefault.jpg" alt="KiRI Demo" width="820">
</a>

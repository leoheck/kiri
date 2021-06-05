# Kicad Diff (kdiff)

This repo is a testcase to have a visual diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsh](https://github.com/jnavila/plotkicadsch) to generate schematic diffs.

It is currently supporting Kicad projects that use GIT.

# Dependencies

> kdiff works with Kicad `5.*`

## Installing dependencies on Windows
[Configure WSL](https://www.tenforums.com/tutorials/46769-enable-disable-windows-subsystem-linux-wsl-windows-10-a.html)

```batch
:: Enalbe Windows Sybsystem for Linux (using Power Shell)
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
#Install-WindowsFeature -Name Microsoft-Windows-Subsystem-Linux

:: Install Ubuntu 20.04
Invoke-WebRequest -Uri https://aka.ms/wsl-ubuntu-2004 -OutFile ~/Downloads/ubuntu-2004.zip
New-Item -Path C:\ubuntu-2004 -ItemType Directory
Expand-Archive -Path ~/Downloads/ubuntu-2004.zip C:\ubuntu-2004
Set-Location C:\ubuntu-2004
& .\ubuntu1804.exe
```

And then continue with the instructions in "Installing dependencies on Linux" inside the WSL (Ubuntu terminal).


## Linux/WSL dependencies

```
# Basic dependencies for Linux/WSL
sudo apt install -y libgmp-dev
sudo apt install -y pkg-config
sudo apt install -y opam
sudo apt install -y python3-pip
sudo apt install -y python3-tk
sudo apt install -y kicad
sudo apt install -y dos2unix
sudo apt install -y coreutils

# Initialize opam
opam init --disable-sandboxing --reinit
opam switch create 4.09.1
opam switch 4.09.1
eval $(opam env)

# Kicad-Diff dependencies
pip3 install pygubu
pip3 install python_dateutil
```

After installing dependencies continue with [Install 3rdParty Tools](https://github.com/leoheck/kdiff#install-3rdparty-tools)

## OSX dependencies

```
# Download and Install Kicad for OSX - https://www.kicad.org/download/macos/
sudo spctl --master-disable

# Opam dependencies
brew install gmp
brew install pkg-config
brew install opam

# Kdiff dependencies
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
```

After installing dependencies continue with [Install 3rdParty Tools](https://github.com/leoheck/kdiff#install-3rdparty-tools)

# Install 3rdParty Tools

```
# Install custom plotgitsch
git clone https://github.com/leoheck/plotkicadsch.git
cd plotkicadsch
./install.sh

# Install Kicad-Diff
git clone https://github.com/Gasman2014/KiCad-Diff.git
```

## Environment Setup (before using it)
```
# Load KiCad-Diff environment
cd KiCad-Diff
source ./env.sh

# Install kdiff environment
git clone https://github.com/leoheck/kdiff
cd kdiff

# Load kdiff environment
source ./env.sh
```

## Using
```
cd [kicad_git_repo]
kdiff board.kicad_pcb
```

## Command line flags (Help)

How to access tool help, this may change, so prefer to use `kdiff -h` instead.

```
➜ kdiff -h

USAGE :

    kdiff [OPTIONS] KICAD_PROJECT_FILE

OPTIONS:

    -a          Track all commits (slower).
    -o HASH     Show commits starting from this one.
    -n HASH     Show commits until this one delimited by this one.
    -r          Remove kidiff folder before run
    -l          Do not launch browser at the end
    -p PORT     Set webserver port
    -V          Verbose
    -h          This help

EXAMPLES:

    # Kicad project on the root of the repo
    kdiff board.pro

    # Nested Kicad projects 
    kdiff nested-project/board.pro -r -V
```

## Examples

Schematic view, assets generated using Plotkicadsch

<p align="center">
	<img src="misc/sch.png" width="820" alt="sch">
</p>

Layout view, assets generated using Kicad-Diff

<p align="center">
	<img src="misc/pcb.png" width="820" alt="pcb">
</p>

Demo on Youtube

[![Demo](http://img.youtube.com/vi/PMC0USSsbDE/0.jpg)](http://www.youtube.com/watch?v=PMC0USSsbDE "")

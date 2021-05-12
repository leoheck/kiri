# Kicad Diff

This repo is a test to have a more complete diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsh](https://github.com/jnavila/plotkicadsch) to generate schematic diffs.

It is currently supporting Kicad projects that use GIT.

# Dependencies

These tools have to be in the `$PATH`
- [Plotgitsh](https://github.com/leoheck/plotkicadsch)
- [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff)


## [Installing dependencies on Windows](https://www.tenforums.com/tutorials/46769-enable-disable-windows-subsystem-linux-wsl-windows-10-a.html)
```
# Enalbe Windows Sybsystem for Linux (using Power Shell)
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
#Install-WindowsFeature -Name Microsoft-Windows-Subsystem-Linux
 
Invoke-WebRequest -Uri https://aka.ms/wsl-ubuntu-2004 -OutFile ~/Downloads/ubuntu-2004.zip
New-Item -Path C:\ubuntu-2004 -ItemType Directory
Expand-Archive -Path ~/Downloads/ubuntu-2004.zip C:\ubuntu-2004
Set-Location C:\ubuntu-2004
& .\ubuntu1804.exe

# Continue with the instructions in "Installing dependencies on Linux" 
```

## Installing dependencies on Linux

```
# Basic dependencis
sudo apt install opam
sudo apt install python3-pip

# Opam (helps installing plotgitsch)
opam switch create 4.09.1
opam switch 4.09.1
eval $(opam config env)

# Install custom plotgitsch
hg clone leoheck/plotkicadsch
cd plotkicadsch
./install.sh

# Kicad-Diff dependencies
pip install pygubu
pip install python_dateutil

# Install Kicad-Diff
hg clone Gasman2014/KiCad-Diff
```

## Installing dependencies on OSX
Install dependencies from "Installing dependencies on Linux" section and then
```
brew install gsed
brew install findutils
```

## Environment Setup (before using it)
```
gh repo clone leoheck/kdiff
cd kdiff
source env.sh
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

    kdiff [OPTIONS] KICAD_PCB

OPTIONS:

    -a          Track all commits (slower). By default it looks only commits related with *.kicad_pcb and *.sch files
    -o HASH     Show commits starting from this one - This HASH is the short version
    -n HASH     Show commits until this one delimited by this one - This HASH is the short version
    -r          Remove kidiff folder before run
    -l          Do not launch browser at the end
    -w VIEWER   Change default page viewer
    -v          Verbose
    -h          This help

EXAMPLES:

    # Kicad project on the root of the repo
    kdiff board.kicad_pcb

    # Nested Kicad projects
    kdiff my_kicad_project/board.kicad_pcb -r -v
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

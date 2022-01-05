# Kicad Revision Inspector (KiRI)

KiRI is small tool to experiment having a visual diff tool for Kicad.
It uses [Kicad-Diff](https://github.com/Gasman2014/KiCad-Diff) to generate layout diffs and [Plotgitsch](https://github.com/jnavila/plotkicadsch) to generate schematic diffs.

It currently supports Kicad 5.* projects that use Git as source management.

Previously known as KDiff, it was renamed KiRI since the old name was pretty close to the KiDiff or Kicad-Diff, one of the projects referred to above.

## Installing

To install this repo and the dependencies with a single command on any Operating System, open a terminal and execute the following commands:

> Windows users must use WSL/WSL2.

```bash
# Installing dependencies
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_dependencies.sh)"
```

```bash
# Installing KiRI and Kicad Plugin
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_kiri.sh)"
```

## Environment preparation on Windows

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
sudo apt install -y scour

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
brew install scour

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
```

# Loading kiri environment

Setup the environment using the follwing commands.

> Make sure you don't forget to change the path to the tool `[PATH_TO_KRIRI]`

```
eval $(opam env)
export TK_SILENCE_DEPRECATION=1
export PATH=[PATH_TO_KRIRI]/kiri/submodules/KiCad-Diff/:PATH
export PATH=[PATH_TO_KRIRI]/kiri/bin:PATH
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

     -a|--all         Include all commits even if schematics/layout don't have changes
     -o|--older HASH  Show commits starting from this one
     -n|--newer HASH  Show commits until this one delimited by this one
     -t|--last VAL    Show last N commits

     -l|--webserver   Do not launch webserver/browser at the end
     -p|--port PORT   Set webserver port. By default it will try to use an available port.

     -s|--skip-cache  Skip usage of -chache.lib on plotgitsch

     -d|--output-dir  Change output folder path/name
     -r|--remove      Remove generated folder before running it
     -x|--archive     Archive generate files

     -v|--version     Show version
     -h|--help        Show help

     -D|--debug       Extra info
    -dp|--debug-sch   Show Plotgitsch stdout and stderr
    -dk|--debug-pcb   Show Kidiff stdout and stderr
     -y|--dry-run     Run without generate artifacts
     -V|--verbose     Verbose

KICAD_PROJECT:

    KICAD_PROJECT file is optional.
    If it is missing the GUI file selector will be loaded

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

#!/bin/bash

get_os_name() {
	case "$OSTYPE" in
		solaris*) echo "SOLARIS" ;;
		darwin*)  echo "OSX" ;; 
		linux*)   echo "LINUX" ;;
		msys*)    echo "WINDOWS" ;;
		bsd*)     echo "BSD" ;;
		*)        echo "unknown" ;;
	esac
}

check_tool() {
	tool=$1
	if ! command -v "${tool}" &> /dev/null; then
		echo "${tool} could not be found, it must be installed"
		exit 1
	fi
}

os=$(get_os_name)

if [[ $os == "LINUX" ]]; then

	sudo apt install -y git

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

fi

if [[ $os == "OSX" ]]; then

	# Download and Install Kicad for OSX - https://www.kicad.org/download/macos/
	if ! open -Ra "kicad"; then
		echo "You need to install Kicad"
		echo "https://www.kicad.org/download/macos/"
		sudo spctl --master-disable
		exit 1
	fi

	check_tool brew
	brew install git

	# Opam dependencies
	brew install gmp
	brew install pkg-config
	brew install opam

	# KiRI dependencies
	brew install gsed
	brew install findutils
	brew install dos2unix
	brew install coreutils

	# Plotgitsch dependencies
	opam install -y lwt_ppx
	opam install -y cmdliner
	opam install -y base64
	opam install -y sha
	opam install -y tyxml
	opam install -y git-unix

fi

# Kicad-Diff dependencies
pip3 install pygubu
pip3 install python_dateutil
pip3 install tk

# Initialize Opam
if [[ -d "~/.opam/4.09.1" ]]; then
	opam init --disable-sandboxing --reinit
	opam switch create 4.09.1
fi
opam switch 4.09.1
eval $(opam env)

# Clone this project
git clone https://github.com/leoheck/kiri
git submodule update --init --recursive

# Install custom plotgitsch
cd plotkicadsch
./install.sh

# Load KiCad-Diff environment
cd ../KiCad-Diff
source ./env.sh

# Load kiri environment
cd ..
source ./env.sh

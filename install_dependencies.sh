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

os=$(get_os_name)

# Basic dependencies for Linux/WSL
if [[ $os == "LINUX" ]]; then

	sudo apt install -y git
	sudo apt install -y libgmp-dev
	sudo apt install -y pkg-config
	sudo apt install -y opam
	sudo apt install -y python3-pip
	sudo apt install -y python3-tk
	sudo apt install -y kicad
	sudo apt install -y dos2unix
	sudo apt install -y coreutils
	sudo apt install -y zenity
	sudo apt install -y dune

fi

if [[ $os == "OSX" ]]; then

	sudo spctl --master-disable

	# Download and Install Kicad for OSX - https://www.kicad.org/download/macos/
	if [ ! -d "/Applications/KiCad/kicad.app" ]
	then
	    curl -Lo ~/Downloads/kicad.dmg https://osdn.net/projects/kicad/storage/kicad-unified-5.1.12-1-10_14.dmg
	    sudo hdiutil attach ~/Downloads/kicad.dmg
	    sudo cp -R /Volumes/KiCad/KiCad /Applications/
	    sudo cp -R /Volumes/KiCad/kicad "/Volumes/KiCad/Application Support/"
	    sudo hdiutil unmount /Volumes/KiCad
	    rm -rf ~/Downloads/kicad.dmg
	fi

	# Install homebrew
	if ! which brew &> /dev/null; then
		/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	fi

	brew install git

	# Opam dependencies
	brew install gmp
	brew install pkg-config
	brew install opam
	brew install dune

	# KiRI dependencies
	brew install gsed
	brew install findutils
	brew install dos2unix
	brew install coreutils
fi

# Kicad-Diff dependencies
pip3 install pygubu
pip3 install python_dateutil
pip3 install tk

# Initialize Opam
if [[ ! -d "$HOME/.opam/4.09.1" ]]; then
	opam init --disable-sandboxing --reinit
	opam switch create 4.09.1
fi
opam switch 4.09.1
eval $(opam env)

# Plotgitsch dependencies
opam install -y digestif
opam install -y lwt
opam install -y lwt_ppx
opam install -y cmdliner
opam install -y base64
opam install -y sha
opam install -y tyxml
opam install -y git-unix

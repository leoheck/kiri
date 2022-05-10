#!/bin/bash

identify_linux_or_wsl()
{
	if uname -rv | grep -q "Microsoft"; then
		echo "WSL"
	else
		echo "Linux"
	fi
}

identify_operating_system()
{
	case "${OSTYPE}" in
		bsd*)     echo "BSD"     ;;
		darwin*)  echo "macOS"   ;;
		linux*)   echo "$(identify_linux_or_wsl)" ;;
		msys*)    echo "Windows" ;;
		solaris*) echo "Solaris" ;;
		*)        echo "Unknown" ;;
	esac
}

identify_linux_pkg_manager()
{
	base_distro="$(grep ID_LIKE /etc/os-release | cut -d= -f2)"

	case "${base_distro}" in
		"debian") echo "apt"     ;;
		"fedora") echo "yum"     ;;
		*)        echo "Unknown" ;;
	esac
}

# =============================================
# Linux apt-related stuff
# =============================================

linux_install_dependencies()
{
	case "$(identify_linux_pkg_manager)" in
		apt)
			linux_install_software_with_apt
			;;
		 # yum)
			# TODO: when someone requests it..
			# linux_install_software_with_yum
		 # 	;;
		*)
			echo "Error: Unknown system"
			echo "Please, ask KiRI dev to adapt the dependencies installer"
			exit
			;;
	esac
}

linux_install_software_with_apt()
{
	# Update packages knowledge
	sudo apt update

	# Install base packages
	sudo apt install -y git
	sudo apt install -y libgmp-dev
	sudo apt install -y pkg-config
	sudo apt install -y opam
	sudo apt install -y python-is-python3
	sudo apt install -y python3-pip
	sudo apt install -y kicad
	sudo apt install -y dos2unix
	sudo apt install -y coreutils
	sudo apt install -y zenity
	sudo apt install -y dune
	sudo apt install -y scour
	sudo apt install -y librsvg2-bin
	sudo apt install -y imagemagick
	sudo apt install -y xdotool
	sudo apt install -y ydotool
}

# =============================================
# Linux yum-related stuff
# =============================================

# linux_install_software_with_yum()
# {
# }

# =============================================
# macOS Related stuff
# =============================================

macos_install_homebrew()
{
	# Install Homebrew
	if ! which brew &> /dev/null; then
		/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	fi
}

macos_install_kicad()
{
	brew install --cask kicad
}

macos_install_brew_modules()
{
	sudo spctl --master-disable

	# Update packages knowledge
	brew update

	# Base dependencies
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
	brew install scour
	brew install wxpython
	brew install wxwidgets
	brew install librsvg
	brew install xdotool
	brew install imagemagick
}

# =============================================
# OS independent stuff
# =============================================

install_python_modules()
{
	# Kicad-Diff dependencies
	pip3 install -U "pillow>8.2.0"
	pip3 install -U "six>=1.15.0"
	pip3 install -U "dateutils>=0.6.12"
	pip3 install -U "python_dateutil>=2.8.1"
	pip3 install -U "pytz>=2021.1"
	pip3 install -U "pathlib>=1.0.1"
	pip3 install -U "wxpython>=4.0.7"
}

init_opam()
{
	# Plotgitsch dependencies
	if [[ ! -d "$HOME/.opam/4.09.1" ]]; then
		opam init --disable-sandboxing --reinit
		opam switch create 4.09.1
	fi
	opam switch 4.09.1
	eval "$(opam env)"
}

install_opam_modules()
{
	# Update packages knowledge
	opam update

	# Plotgitsch dependencies
	opam install -y digestif
	opam install -y lwt
	opam install -y lwt_ppx
	opam install -y cmdliner
	opam install -y base64
	opam install -y sha
	opam install -y tyxml
	opam install -y git-unix
}

# =============================================
# WSL dependent stuff
# =============================================

setup_inskape_worakaround()
{
	read -r -d '' PROFILE <<-EOM
	# Inkscape workaround: Temporary workaround for broken libgc
	if [[ -z "\$_INKSCAPE_GC" ]]; then
	    export _INKSCAPE_GC=disable
	fi

	export DISPLAY=\$(grep nameserver /etc/resolv.conf | awk '{print \$2}'):0.0
	EOM

	echo -e "\n${PROFILE}" >> ~/.profile
}

# ================================

main()
{
	operating_system="$(identify_operating_system)"

	case "${operating_system}" in
		"Linux")
			linux_install_dependencies
			;;

		"macOS")
			macos_install_homebrew
			macos_install_kicad
			macos_install_brew_modules
			;;

		"WSL")
			linux_install_dependencies
			setup_inskape_worakaround
			;;

		*)
			echo "Installer does not handle \"${operating_system}\" yet."
			exit 1
			;;
	esac

	install_python_modules

	init_opam
	install_opam_modules
}

main "${@}"

#!/bin/bash

ctrl_c()
{
	exit 1
}

identify_linux_or_wsl()
{
	if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
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
	distro_id="$(grep "^ID=" /etc/os-release | cut -d= -f2)"
	distro_id_like="$(grep "^ID_LIKE=" /etc/os-release | cut -d= -f2)"

	# Debian does not have "ID_LIKE"
	if [[ "${distro_id}" == "debian" ]] || [[ "${distro_id_like}" =~ "debian" ]]; then
		base_distro="debian"
	else
		base_distro="${distro_id}"
	fi

	case "${base_distro}" in
		"debian")   echo "apt"     ;;
		"fedora")   echo "dnf"     ;;
		"redhat")   echo "yum"     ;;
		"arch")     echo "pacman"  ;;
		"archarm")  echo "pacman"  ;;
		"manjaro")  echo "pacman"  ;;
		*)          echo "Unknown" ;;
	esac
}

linux_install_dependencies()
{
	pkg_manager="$(identify_linux_pkg_manager)"

	case "${pkg_manager}" in
		apt)
			linux_install_software_with_apt
			;;
		dnf)
			linux_install_software_with_dnf
			;;
		# yum)
			# TODO: when someone requests it..
			# linux_install_software_with_yum
		# 	;;
		pacman)
			linux_install_software_with_pacman
			;;
		*)
			echo "Error: Unknown system"
			echo "Please, ask KiRI dev to adapt the dependencies installer"
			exit
			;;
	esac
}

# =============================================
# Linux apt-related stuff
# =============================================

linux_install_software_with_apt()
{
	# Update packages knowledge
	sudo apt-get update

	# Install base packages
	sudo apt-get install -y git
	sudo apt-get install -y build-essential
	sudo apt-get install -y libgtk-3-dev
	sudo apt-get install -y libgmp-dev
	sudo apt-get install -y pkg-config
	sudo apt-get install -y opam
	sudo apt-get install -y python-is-python3
	sudo apt-get install -y python3-pip
	sudo apt-get install -y kicad
	sudo apt-get install -y coreutils
	sudo apt-get install -y zenity
	sudo apt-get install -y librsvg2-bin
	sudo apt-get install -y imagemagick
	sudo apt-get install -y xdotool
	sudo apt-get install -y rename # perl rename and not util-linux
}

# =============================================
# Linux dnf-related stuff
# =============================================

linux_install_software_with_dnf()
{
	# Update packages knowledge
	sudo dnf check-update

	# Install base packages
	# sudo dnf install -y git
	# sudo dnf install -y pkg-config
	# sudo dnf install -y coreutils
	# sudo dnf install -y zenity

	# sudo dnf install -y build-essential
	# sudo dnf install -y libgtk-3-dev
	# sudo dnf install -y libgmp-dev
	# sudo dnf install -y python-is-python3
	# sudo dnf install -y librsvg2-bin

	sudo dnf install -y opam
	sudo dnf install -y python3-pip
	sudo dnf install -y kicad
	sudo dnf install -y ImageMagick
	sudo dnf install -y xdotool
	sudo dnf install -y prename # perl rename and not util-linux
}

# =============================================
# Linux yum-related stuff
# =============================================

# linux_install_software_with_yum()
# {
# }

# =============================================
# Linux yum-related stuff
# =============================================

linux_install_software_with_pacman()
{
	yes | sudo pacman -S make --needed
	yes | sudo pacman -S patch --needed
	yes | sudo pacman -S opam --needed
	yes | sudo pacman -S python-pip --needed
	yes | sudo pacman -S kicad --needed
	yes | sudo pacman -S imagemagick --needed
	yes | sudo pacman -S xdotool --needed
	yes | sudo pacman -S perl-rename --needed
}

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
	kicad_5="/Applications/Kicad/Kicad.app"
	kicad_6="/Applications/KiCad/KiCad.app"

	if [[ ! -d "${kicad_5}" ]] && [[ ! -d "${kicad_6}" ]]; then
		brew install --cask kicad
	fi
}

macos_install_brew_modules()
{
	sudo spctl --master-disable
	xcode-select --install

	# Update packages knowledge
	#brew update

	# Base dependencies
	brew install git

	# Opam dependencies
	brew install gmp
	brew install pkg-config
	brew install opam

	# KiRI dependencies
	brew install gsed
	brew install findutils
	brew install coreutils
	brew install wxpython
	brew install wxwidgets
	brew install librsvg
	brew install imagemagick
	brew install cliclick
	brew install rename
	brew install dos2unix
}

# =============================================
# OS independent stuff
# =============================================

install_python_modules()
{
	if [[ -z "${KIRI_HOME}" ]]; then
		KIRI_HOME="./"
	fi

	# python_venv_path="${KIRI_HOME}/venv/"

	# if [[ ! -d ${python_venv_path} ]]; then
		# python3 -m venv ${KIRI_HOME}/venv/
	# fi

	# source "${python_venv_path}/bin/activate"

	# Kicad-Diff dependencies
	if [[ -f "${KIRI_HOME}/python-requirements.txt" ]]; then
		yes | pip3 install -r "${KIRI_HOME}/python-requirements.txt"
	else
		yes | pip3 install -r https://raw.githubusercontent.com/leoheck/kiri/main/python-requirements.txt
	fi
}

init_opam()
{
	if [[ -z "${OPAM_VERSION}" ]]; then
		OPAM_VERSION=4.10.2
	fi

	if [[ ! -d "${HOME}/.opam/${OPAM_VERSION}" ]]; then
		yes | opam init --disable-sandboxing --reinit
		opam switch create ${OPAM_VERSION}
	else
		opam switch ${OPAM_VERSION}
	fi

	eval "$(opam env)"
}

install_opam_modules()
{
	eval "$(opam env)"

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
	opam install -y git
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

	if [[ -f ${HOME}/.profile ]]; then
		echo -e "\n${PROFILE}" >> ${HOME}/.profile
	fi

	if [[ -f ${HOME}/.bashrc ]]; then
		echo -e "\n${PROFILE}" >> ${HOME}/.bashrc
	fi

	if [[ -f ${HOME}/.zshrc ]]; then
		echo -e "\n${PROFILE}" >> ${HOME}/.zshrc
	fi
}

# ================================

main()
{
	trap ctrl_c INT

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

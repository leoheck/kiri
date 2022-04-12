#!/bin/bash

# Install KiRI and Kicad Plugin

# Set INSTALL_KIRI_REMOTELLY, to have kiri donwloaded from GitHub
# Otherwise it will install the local version of the script

# Default KIRI_INSTALL_PATH: ${HOME}/.local/share

CI=$(tput setaf 3) # Color Info
CB=$(tput bold)    # Color Bold
CR=$(tput sgr0)    # Color Reset

export KIRI_INSTALL_PATH
export KIRI_HOME

install_kiri()
{
	# Remove previews version, if any
	rm -rf "${KIRI_HOME}/kiri"

	if [[ -n "${INSTALL_KIRI_REMOTELLY}" ]]; then

		# Clone Kiri
		if which git &> /dev/null; then
			git clone --recurse-submodules -j8 https://github.com/leoheck/kiri.git "${KIRI_HOME}"
			cd "${KIRI_HOME}/kiri/" || exit
		else
			echo "Git is missing, please use install_dependencies script"
			exit 1
		fi

	else
		cp -rf "../kiri" "${KIRI_HOME}"
	fi
}

install_plotgitsch()
{
	# Reload opam making sure it is available in the PATH
	eval "$(opam env)"

	# Install plotkicadsch
	cd "${KIRI_HOME}/kiri/submodules/plotkicadsch" || exit
	opam pin add -y kicadsch .
	opam pin add -y plotkicadsch .
	opam update -y
	opam install -y plotkicadsch
	cd - || exit
}

intall_kicad_plugin()
{
	if [[ -n "${INSTALL_KIRI_REMOTELLY}" ]]; then
		local install_url="https://raw.githubusercontent.com/leoheck/kiri/main/install_plugin.sh"
		bash -c "$(curl -fsSL ${install_url})" "" "${KIRI_HOME}/kiri/" > /dev/null
	else	
		./install_plugin.sh
	fi
}

show_env_config_message()
{
	read -r -d '' ENV_SETUP_NOTE <<-EOM
	${CI}${CB}Finish KiRi setup by adding the following lines in the end of your ~/.bashrc or ~/.zshrc${CR}

	# Kiri environment setup
	eval \$(opam env)
	export KIRI_HOME="${KIRI_HOME}/kiri"
	export PATH=\${KIRI_HOME}/submodules/KiCad-Diff/bin:\${PATH}
	export PATH=\${KIRI_HOME}/bin:\${PATH}
	EOM

	echo -e "\n\n${ENV_SETUP_NOTE}\n"
}

show_initial_message()
{
	if [[ -n "${KIRI_INSTALL_PATH}" ]]; then
		KIRI_HOME="${KIRI_INSTALL_PATH}"
	else
		KIRI_HOME="${HOME}/.local/share"
	fi

	read -r -d '' ENV_SETUP_NOTE <<-EOM
	${CI}${CB}Installing KiRI${CR}

	Installation path ${KIRI_HOME}
	Change it using KIRI_INSTALL_PATH environment variable

	Hit ENTER to continue or Ctrl+C to leave. 
	EOM

	echo -e "\n${ENV_SETUP_NOTE}\n"

	read
}

main()
{
	show_initial_message
	install_kiri
	install_plotgitsch
	intall_kicad_plugin
	show_env_config_message
}

main

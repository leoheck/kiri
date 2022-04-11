#!/bin/bash

# Install KiRI and Kicad Plugin
# kiri path must be in your environment PATH variable for Kicad Plugin work

# Set INSTALL_KIRI_REMOTELLY, to have kiri donwloaded from GitHub
# Otherwise it will install the local version of the script

# Default INSTALL_PATH: ${HOME}/.local/share

CI=$(tput setaf 3) # Color Info
CB=$(tput bold)    # Color Bold
CR=$(tput sgr0)    # Color Reset

install_kiri()
{
	if [[ -s ${KIRI_HOME} ]]; then
		INSTALL_PATH="${KIRI_HOME}"
	else
		INSTALL_PATH="${HOME}/.local/share"
	fi

	# Remove previews version, if any
	rm -rf "${INSTALL_PATH}/kiri"

	# Reload opam making sure it is in the the PATH
	eval "$(opam env)"

	if [[ -n "${INSTALL_KIRI_REMOTELLY}" ]]; then

		# Clone Kiri
		if which git &> /dev/null; then
			git clone --recurse-submodules -j8 https://github.com/leoheck/kiri.git "${INSTALL_PATH}"
			cd "${INSTALL_PATH}/kiri/" || exit
		else
			echo "Git is missing, please use install_dependencies script"
			exit 1
		fi

	else

		cp -rf "../${INSTALL_PATH}"

	fi
}

install_plotgitsch()
{
	# Install plotkicadsch
	cd "${INSTALL_PATH}/kiri/submodules/plotkicadsch" || exit
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
		bash -c "$(curl -fsSL ${install_url})" "" "${INSTALL_PATH}/kiri/" > /dev/null
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
	export KIRI_HOME=${INSTALL_PATH}/kiri
	export PATH=\${KIRI_HOME}/submodules/KiCad-Diff/bin:\${PATH}
	export PATH=\${KIRI_HOME}/bin:\${PATH}
	EOM

	echo -e "\n\n${ENV_SETUP_NOTE}\n"
}

main()
{
	install_kiri
	install_plotgitsch
	intall_kicad_plugin
	show_env_config_message
}

main

#!/bin/bash

# Install Kicad plugin
# For this plugin work, KiRI, kidiff and plotgitsh must be in the enviromnment variable PATH

install_kiri_if_using_kicad_5()
{
	if [[ -d "${HOME}/.kicad" ]]; then

		case "${OSTYPE}" in
			darwin*)
				KICAD_PLUGINS_PATH="$HOME/Library/Preferences/kicad/scripting/plugins"
				;;
			*)
				KICAD_PLUGINS_PATH="$HOME/.kicad/scripting/plugins"
				;;
		esac

		mkdir -p "${KICAD_PLUGINS_PATH}"
		rm -rf "${KICAD_PLUGINS_PATH}/kiri"
		cp -r "${KIRI_REPO_PATH}/kicad/plugin/kiri_v5" "${KICAD_PLUGINS_PATH}/kiri"
		echo "Installed kiri plugin in ${KICAD_PLUGINS_PATH}/kiri"
	fi
}

install_kiri_if_using_kicad_6()
{
	# Kicad 6 is installed
	if [[ -d "$HOME/.local/share/kicad/6.0/" ]]; then

		case "${OSTYPE}" in
			darwin*)
				KICAD_PLUGINS_PATH="$HOME/Library/Preferences/Kicad/scripting/plugins"
				;;
			*)
				KICAD_PLUGINS_PATH="$HOME/.local/share/kicad/6.0/scripting/plugins"
				;;
		esac

		mkdir -p "${KICAD_PLUGINS_PATH}"
		rm -rf "${KICAD_PLUGINS_PATH}/kiri"
		cp -r "${KIRI_REPO_PATH}/kicad/plugin/kiri_v6" "${KICAD_PLUGINS_PATH}/kiri"
		echo "Installed kiri plugin in ${KICAD_PLUGINS_PATH}/kiri"
	fi
}

main()
{
	if [[ -z "${KIRI_REPO_PATH}" ]]; then
		if [[ "$(basename "$(pwd)")" == "kiri" ]]; then
			KIRI_REPO_PATH=.
		else
			KIRI_REPO_PATH="${HOME}/.local/share/kiri"
		fi
	fi

	install_kiri_if_using_kicad_5
	install_kiri_if_using_kicad_6
}

main

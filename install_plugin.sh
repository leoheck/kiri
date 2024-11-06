#!/bin/bash

# Install Kicad plugin
# For this plugin work, KiRI, kidiff and plotgitsh must be in the enviromnment variable PATH

# Kicad = 5
install_kiri_for_kicad_5()
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
		echo "Kiri plugin installed in ${KICAD_PLUGINS_PATH}/kiri"
	fi
}

# Kicad >= 6
install_kiri_for_kicad()
{
	kicad_version=$1

	if [[ -d "$HOME/.local/share/kicad/${kicad_version}/" ]]; then

		case "${OSTYPE}" in
			darwin*)
				KICAD_PLUGINS_PATH="$HOME/Library/Preferences/Kicad/scripting/plugins"
				;;
			*)
				KICAD_PLUGINS_PATH="$HOME/.local/share/kicad/${kicad_version}/scripting/plugins"
				;;
		esac

		mkdir -p "${KICAD_PLUGINS_PATH}"
		rm -rf "${KICAD_PLUGINS_PATH}/kiri"
		cp -r "${KIRI_REPO_PATH}/kicad/plugin/kiri_v6" "${KICAD_PLUGINS_PATH}/kiri"
		echo "Kiri plugin installed in ${KICAD_PLUGINS_PATH}/kiri"
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

	kicad_version=$(kicad_version.py | cut -d"." -f1-2)

	case ${kicad_version} in
		5.0) install_kiri_for_kicad_5 ;;
		*) install_kiri_for_kicad "${kicad_version}" ;;
	esac
}

main

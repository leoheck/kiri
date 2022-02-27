#!/bin/bash

# Install Kicad plugin on Kicad v5
# kiti, kidiff and plotgitsh must be in PATH

KIRI_REPO_PATH=$1

if [ -z "${KIRI_REPO_PATH}" ]; then
	KIRI_REPO_PATH=.
fi

case $OSTYPE in
	darwin*)
		KICAD_PLUGINS_PATH="$HOME/Library/Preferences/kicad/scripting/plugins"
		;;
	*)
		KICAD_PLUGINS_PATH="$HOME/.kicad/scripting/plugins"
		;;
esac

if [[ -d "${HOME}/.kicad" ]]; then
	mkdir -p "${KICAD_PLUGINS_PATH}"
	rm -rf "${KICAD_PLUGINS_PATH}/kiri"
	cp -r "${KIRI_REPO_PATH}/kicad/plugin/kiri_v5" "${KICAD_PLUGINS_PATH}/kiri"
	echo "Installed kiri plugin in ${KICAD_PLUGINS_PATH}/kiri"
fi

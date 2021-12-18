#!/bin/bash

# Install Kicad plugin on Kicad v5
# kiti, kidiff and plotgitsh must be in PATH

case $OSTYPE in
	darwin*)
		KICAD_PLUGINS_PATH="$HOME/Library/Preferences/kicad/scripting/plugins"
		;;
	*)
		KICAD_PLUGINS_PATH="$HOME/.kicad/scripting/plugins"
		;;
esac

mkdir -p "${KICAD_PLUGINS_PATH}"
rm -rf "${KICAD_PLUGINS_PATH}/kiri"

cp -r "./kicad/plugin/kiri_v5" "${KICAD_PLUGINS_PATH}/kiri"

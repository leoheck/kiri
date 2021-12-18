#!/bin/bash

# Install Kicad Plugin only
# KiRI must be in PATH for Kicad Plugin work

case $OSTYPE in
	darwin*)
		KICAD_PLUGINS_PATH="$HOME/Library/Preferences/Kicad/scripting/plugins"
		;;
	*)
		KICAD_PLUGINS_PATH="$HOME/.local/share/kicad/6.0/scripting/plugins"
		;;
esac

mkdir -p "${KICAD_PLUGINS_PATH}"
rm -rf "${KICAD_PLUGINS_PATH}/kiri"

# cp -r "${HOME}/kiri/kicad_plugin" "${KICAD_PLUGINS_PATH}/kiri"
cp -r "./kicad_plugin" "${KICAD_PLUGINS_PATH}/kiri"

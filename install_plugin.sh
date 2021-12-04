#!/bin/bash

# Install Kicad Plugin only
# KiRI must be in PATH for Kicad Plugin work

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
cp -r "${HOME}/kiri/kicad_plugin" "${KICAD_PLUGINS_PATH}/kiri"

#!/bin/bash

# Install Kicad Plugin
# To work, kiri must be in PATH

case $OSTYPE in
	darwin*)
		KICAD_PLUGINS_PATH="$HOME/Library/Preferences/kicad/scripting/plugins"
		;;
	*)
		KICAD_PLUGINS_PATH="$HOME/.kicad/scripting/plugins"
		;;
esac

mkdir -p ${KICAD_PLUGINS_PATH}
rm -rf ${KICAD_PLUGINS_PATH}/kiri
cp -r kicad_plugin ${KICAD_PLUGINS_PATH}/kiri

#!/bin/bash

# Install Kicad Plugin
# To work, kiri must be in PATH

# Donwload repo zip
curl https://github.com/leoheck/kiri/archive/refs/heads/main.zip -O /tmp/kiri.zip

# Remove old if any
rm -rf $HOME/kiri

unzip /tmp/kiri.zip -d $HOME/
rm -rf kiri.zip

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

echo
echo "Add the follwing lines to your ~/.bashrc or ~/.zshrc"
echo "source \$HOME/kiri/env.sh"
echo "source \$HOME/kiri/submodules/KiCad-Diff/env.sh"
echo
#!/bin/bash

# Install KiRI and Kicad Plugin
# KiRI must be in PATH for Kicad Plugin work

# Remove old version if any
rm -rf $HOME/kiri

if which git &> /dev/null; then

	git clone https://github.com/leoheck/kiri.git $HOME/kiri

else

	curl -LkSs https://github.com/leoheck/kiri/archive/refs/heads/main.zip -o /tmp/kiri.zip

	cd /tmp
	unzip /tmp/kiri.zip
	rm -rf kiri.zip

	mv kiri-main $HOME/kiri

fi

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
cp -r $HOME/kiri/kicad_plugin ${KICAD_PLUGINS_PATH}/kiri

echo
echo
echo "Add the follwing lines to your ~/.bashrc or ~/.zshrc"
echo
echo "source \$HOME/kiri/env.sh"
echo "source \$HOME/kiri/submodules/KiCad-Diff/env.sh"
echo
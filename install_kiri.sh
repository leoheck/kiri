#!/bin/bash

# Install KiRI and Kicad Plugin
# KiRI must be in PATH for Kicad Plugin work

# Remove old version if any
rm -rf $HOME/kiri

# Make sure opam is in the the PATH
eval $(opam env)

if which git &> /dev/null; then
	git clone --recurse-submodules -j8 https://github.com/leoheck/kiri.git $HOME/kiri
	cd $HOME/kiri/
else
	echo "Git is missing"
	exit 1
fi

# Install plotkicadsch
cd $HOME/kiri/submodules/plotkicadsch
opam pin add -y kicadsch .
opam pin add -y plotkicadsch .
opam update -y
opam install -y plotkicadsch
cd -

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
echo "Add the following lines to your ~/.bashrc or ~/.zshrc"
echo
echo "source \${HOME}/kiri/env.sh"
echo

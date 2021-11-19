#!/bin/bash

# Install KiRI and Kicad Plugin
# KiRI must be in PATH for Kicad Plugin work

# Remove old version if any
rm -rf $HOME/kiri

if which git &> /dev/null; then

	git clone --recurse-submodules -j8 https://github.com/leoheck/kiri.git $HOME/kiri

else

	curl -LkSs https://github.com/leoheck/kiri/archive/refs/heads/main.zip -o /tmp/kiri.zip
	curl -LkSs https://github.com/leoheck/KiCad-Diff/archive/cb5631cabf847f033341ef2eb41c93d7b150c1ad.zip -o /tmp/KiCad-Diff.zip
	curl -LkSs https://github.com/jnavila/plotkicadsch/archive/4603ff9d66c7bd1ab19249271830bb10e36afc67.zip -o /tmp/plotkicadsch.zip
	
	cd /tmp

	unzip -qq /tmp/kiri.zip
	unzip -qq /tmp/KiCad-Diff.zip
	unzip -qq /tmp/plotkicadsch.zip	

	rm -rf /tmp/kiri.zip
	rm -rf /tmp/KiCad-Diff.zip
	rm -rf /tmp/plotkicadsch.zip

	mv /tmp/kiri-main $HOME/kiri
	mv /tmp/plotkicadsch-4603ff9d66c7bd1ab19249271830bb10e36afc67 $HOME/kiri/submodules/plotkicadsch
	mv /tmp/KiCad-Diff-cb5631cabf847f033341ef2eb41c93d7b150c1ad $HOME/kiri/submodules/KiCad-Diff

	cd -

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
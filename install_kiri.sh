#!/bin/bash

# Install KiRI and Kicad Plugin
# KiRI must be in PATH for Kicad Plugin work

install_path="${HOME}/.local/share"

# Remove old version if any
rm -rf "${install_path}/kiri"

# Make sure opam is in the the PATH
eval "$(opam env)"

if which git &> /dev/null; then
	git clone --recurse-submodules -j8 https://github.com/leoheck/kiri.git "${install_path}/kiri"
	cd "${install_path}/kiri/" || exit
else
	echo "Git is missing"
	exit 1
fi

# ===============

# Install plotkicadsch
cd "${install_path}/kiri/submodules/plotkicadsch" || exit
opam pin add -y kicadsch .
opam pin add -y plotkicadsch .
opam update -y
opam install -y plotkicadsch
cd - || exit

# ===============

# Kicad v5 plugin
case $OSTYPE in
	darwin*)
		KICAD_PLUGINS_PATH="${HOME}/Library/Preferences/kicad/scripting/plugins"
		;;
	*)
		KICAD_PLUGINS_PATH="${HOME}/.kicad/scripting/plugins"
		;;
esac

if [[ -d ${HOME}/.kicad ]]; then
	mkdir -p "${KICAD_PLUGINS_PATH}"
	rm -rf "${KICAD_PLUGINS_PATH}/kiri"
	cp -r "${install_path}/kiri/kicad/plugin/kiri_v5" "${KICAD_PLUGINS_PATH}/kiri"
fi

# ===============

# Kicad v6 plugin
case $OSTYPE in
	darwin*)
		KICAD_PLUGINS_PATH="$HOME/Library/Preferences/Kicad/scripting/plugins"
		;;
	*)
		KICAD_PLUGINS_PATH="$HOME/.local/share/kicad/6.0/scripting/plugins"
		;;
esac

if [[ -d ${HOME}/$HOME/.local/share/kicad/6.0/ ]]; then
	mkdir -p "${KICAD_PLUGINS_PATH}"
	rm -rf "${KICAD_PLUGINS_PATH}/kiri"
	cp -r "${install_path}/kiri/kicad/plugin/kiri_v6" "${KICAD_PLUGINS_PATH}/kiri"
fi

# ===============

read -r -d '' ENV_SETUP_NOTE << EOM

Add the following lines to your ~/.bashrc or ~/.zshrc

# Kiri environment setup
eval \$(opam env)
export TK_SILENCE_DEPRECATION=1
export PATH=${install_path}/kiri/submodules/KiCad-Diff/:\${PATH}
export PATH=${install_path}/kiri/bin:\${PATH}

EOM

echo -e "${ENV_SETUP_NOTE}"

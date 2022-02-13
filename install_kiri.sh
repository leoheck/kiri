#!/bin/bash

# Install KiRI and Kicad Plugin
# KiRI must be in PATH for Kicad Plugin work

cinfo=$(tput setaf 3)
cbold=$(tput bold)
crst=$(tput sgr0)

if [[ -n ${KIRI_INSTALL_PATH} ]]; then
	INSTALL_PATH="${KIRI_INSTALL_PATH}"
else
	INSTALL_PATH="${HOME}/.local/share"
fi

# Remove old version if any
rm -rf "${INSTALL_PATH}/kiri"

# Reload opam making sure it is in the the PATH
eval "$(opam env)"

# Clone Kiri
if which git &> /dev/null; then
	git clone --recurse-submodules -j8 https://github.com/leoheck/kiri.git "${INSTALL_PATH}/kiri"
	cd "${INSTALL_PATH}/kiri/" || exit
else
	echo "Git is missing"
	exit 1
fi

# ===============

# Install plotkicadsch
cd "${INSTALL_PATH}/kiri/submodules/plotkicadsch" || exit
opam pin add -y kicadsch .
opam pin add -y plotkicadsch .
opam update -y
opam install -y plotkicadsch
cd - || exit

# ===============

# Kicad v5 plugin
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_plugin.sh)" "" "${INSTALL_PATH}/kiri/" > /dev/null

# Kicad v6 plugin
bash -c "$(curl -fsSL https://raw.githubusercontent.com/leoheck/kiri/main/install_plugin_v6.sh)" "" "${INSTALL_PATH}/kiri/" > /dev/null

# ===============

read -r -d '' ENV_SETUP_NOTE <<EOM

${cinfo}${cbold}Finish the setup by adding the following lines to your ~/.bashrc or ~/.zshrc${crst}

# Kiri environment setup
eval \$(opam env)
export KIRI_HOME=${INSTALL_PATH}/kiri
export PATH=\${KIRI_HOME}/submodules/KiCad-Diff/:\${PATH}
export PATH=\${KIRI_HOME}/bin:\${PATH}


EOM

echo -e "\n\n${ENV_SETUP_NOTE}\n"

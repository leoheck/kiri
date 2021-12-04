#!/bin/bash

# Setup for Kicad-Nigtly (>= 5.99) python modules

case ${OSTYPE} in

	# MaxOS (update to your Kicad nightly path)
	darwin*)
		export PYTHONPATH="/Applications/KiCad/kicad.app/Contents/Frameworks/python/site-packages/"
		export LD_LIBRARY_PATH="${PYTHONPATH}"
		;;

	# Linux
	*)
		export PYTHONPATH="/usr/lib/kicad-nightly/lib/python3/dist-packages/"
		export LD_LIBRARY_PATH="${PYTHONPATH}"
		;;

esac

source ./env.sh

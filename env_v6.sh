#!/bin/bash

# Usage: Source this file as:
# $> source ./env.sh

readlink()
{
	case $OSTYPE in
		darwin*)
			greadlink -f "$1"
			;;
		*)
			readlink -f "$1"
			;;
	esac
}

script=$(readlink "$0")
script_path=$(dirname "$script")

# Kicad v6 paths
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

export PATH="${script_path}/bin":$PATH
export PATH="${script_path}/submodules/KiCad-Diff/bin":$PATH

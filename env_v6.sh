#!/bin/bash

# Usage: Source this file as:
# $> source ./env.sh

export TK_SILENCE_DEPRECATION=1

readlink_osx()
{
	target_file="$1"
	dir_name=$(dirname "$target_file")

	cd "${dir_name}" || exit
	target_file=$(basename "$target_file")

	# Iterate down a (possible) chain of symlinks
	while [ -L "$target_file" ]
	do
		target_file=$(readlink "$target_file")
		cd "$(dirname "$target_file")" || exit
		target_file=$(basename "$target_file")
	done

	# Compute the canonicalized name by finding the physical path
	# for the directory we're in and appending the target file.
	phys_dir=$(pwd -P)

	result="$phys_dir/$target_file"

	echo "$result"
}

readlink_()
{
	case $OSTYPE in
		darwin*)
			readlink_osx "$1"
			;;
		*)
			readlink -f "$1"
			;;
	esac
}

script=$(readlink_ "$0")
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

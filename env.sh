#!/bin/bash

# Usage: Source this file as:
# $> source ./env.sh

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

export PATH="${script_path}/bin:$PATH"

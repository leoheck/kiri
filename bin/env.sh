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
			command readlink -f "$1"
			;;
	esac
}

script=$(readlink_ "$0")
script_path=$(dirname "$script")

export PATH="${script_path}":$PATH

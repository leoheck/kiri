#!/usr/bin/env python3

"""
Get Kicad version
"""

import argparse
import os
import sys
import re
import shutil
import platform
import subprocess

if platform.system() == "Darwin":
    sys.path.insert(0, "/Applications/Kicad/kicad.app/Contents/Frameworks/python/site-packages/")
    sys.path.insert(0, "/Applications/KiCad/kicad.app/Contents/Frameworks/python/site-packages/")

if platform.system() == "Linux":
    sys.path.insert(0, "/usr/lib/kicad/lib/python3/dist-packages/")

    # This needs this export
    #export LD_LIBRARY_PATH="/usr/lib/kicad-nightly/lib/x86_64-linux-gnu/:$LD_LIBRARY_PATH"
    sys.path.insert(0, "/usr/lib/kicad-nightly/lib/python3/dist-packages/")


# Disable GTK complains
devnull = os.open(os.devnull, os.O_WRONLY)
old_stderr = os.dup(2)
os.dup2(devnull, 2)

import pcbnew as pn

# Enable it back
os.dup2(old_stderr, 2)
os.close(devnull)


def parse_cli_args():
    parser = argparse.ArgumentParser(description="Plot PCB Layers")
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Extra shows information"
    )
    parser.add_argument(
        "-M", "--major", action="store_true", help="Show major version"
    )
    parser.add_argument(
        "-m", "--minor", action="store_true", help="Show minor version"
    )
    parser.add_argument(
        "-p", "--patch", action="store_true", help="Show patch version"
    )
    parser.add_argument(
        "-e", "--extra", action="store_true", help="Show extra version"
    )
    parser.add_argument(
        "-Mm", "--major-minor", action="store_true", help="Show major.minor versions"
    )
    parser.add_argument(
        "-Mmp", "--major-minor-patch", action="store_true", help="Show major.minor.patch versions"
    )
    args = parser.parse_args()
    return args


if __name__ == "__main__":

    args = parse_cli_args()

    if hasattr(pn, 'GetBuildVersion'):
        pcbnew_full_version = pn.GetBuildVersion().strip("()")
        version_major = int(pcbnew_full_version.strip("()").split(".")[0])
        version_minor = int(pcbnew_full_version.strip("()").split(".")[1])
        version_patch = int(pcbnew_full_version.strip("()").split(".")[2].replace("-", "+").split("+")[0])
        extra_version_str = pcbnew_full_version.replace("{}.{}.{}".format(version_major, version_minor, version_patch), "")
        extra_version_str = re.sub(r'^[^A-Za-z0-9]+', '', extra_version_str)
    else:
        pcbnew_full_version = "5.x.x (Unknown)"
        version_major = 5
        version_minor = 0
        version_patch = 0
        extra_version_str = ""

    pcbnew_custom_version = None

    if args.major:
        pcbnew_custom_version = version_major

    if args.minor:
        pcbnew_custom_version = version_minor

    if args.patch:
        pcbnew_custom_version = version_minor

    if args.extra:
        pcbnew_custom_version = extra_version_str

    if args.major_minor:
        pcbnew_custom_version = "{:d}.{:d}".format(version_major, version_minor)

    if args.major_minor_patch:
        pcbnew_custom_version = "{:d}.{:d}.{:d}".format(version_major, version_minor, version_patch)

    if not pcbnew_custom_version:
        print(pcbnew_full_version)
    else:
        print(pcbnew_custom_version)

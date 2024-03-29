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


import pcbnew as pn


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
    args = parser.parse_args()
    return args


if __name__ == "__main__":

    args = parse_cli_args()

    if hasattr(pn, 'GetBuildVersion'):
        pcbnew_version = pn.GetBuildVersion().strip("()")
        version_major = int(pcbnew_version.strip("()").split(".")[0])
        version_minor = int(pcbnew_version.strip("()").split(".")[1])
        version_patch = int(pcbnew_version.strip("()").split(".")[2].replace("-", "+").split("+")[0])
        extra_version_str = pcbnew_version.replace("{}.{}.{}".format(version_major, version_minor, version_patch), "")
    else:
        pcbnew_version = "5.x.x (Unknown)"
        version_major = 5
        version_minor = 0
        version_patch = 0
        extra_version_str = ""

    if args.major:
        print(version_major)
    else:
        if args.minor:
            print(version_minor)
        else:
            if args.patch:
                print(version_patch)
            else:
                print(pcbnew_version)

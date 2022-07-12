#!/usr/bin/env python3

import argparse
import os
import sys


sys.path.insert(1, '/home/lheck/Documents/kiri/')
from submodules.kicad_parser.kicad_pcb import *
from submodules.kicad_parser.sexp_parser import *

from tabulate import tabulate

def parse_cli_args():
    parser = argparse.ArgumentParser(description="EEschema hierarchy finder")
    parser.add_argument(
        "kicad_sch", metavar="KICAD_SCH_PATH", help="Kicad main SCH path"
    )
    args = parser.parse_args()

    return args


if __name__ == "__main__":

    args = parse_cli_args()
    sch_file_path = str(args.kicad_sch)

    if not os.path.exists(sch_file_path):
        print("Error: Main schematic file '{}' is missing".format(sch_file_path))
        exit(1)


    project_name = os.path.splitext(os.path.basename(sch_file_path))[0]

    # print("sch_file_path:", sch_file_path)
    # print(" project_name:", project_name)
    # exit(1)


    # reusing existing thing to load a file...
    sch = KicadPCB.load(sch_file_path)

    # check for error
    for e in sch.getError():
        print('Error: {}'.format(e))


    # (sheet (at 114.3 86.36) (size 36.83 20.32) (fields_autoplaced)
    #   (stroke (width 0.1524) (type solid) (color 0 0 0 0))
    #   (fill (color 0 0 0 0.0000))
    #   (uuid 005b247a-5ac7-4cdf-ac41-9dda744d73ba)
    #   (property "Sheet name" "Page_2_Instance_2" (id 0) (at 114.3 85.6484 0)
    #     (effects (font (size 1.27 1.27)) (justify left bottom))
    #   )
    #   (property "Sheet file" "sch/page_2.kicad_sch" (id 1) (at 114.3 107.2646 0)
    #     (effects (font (size 1.27 1.27)) (justify left top))
    #   )
    # )

    sheet_name = 0
    sheet_file = 1

    field = 0
    value = 1

    # When there are multiples instances
    try:
        # print(type(sch.sheet), sch.sheet)
        for k in sch.sheet:
            uuid=k['uuid']
            inst_name=k['property'][sheet_name][value].strip('\"')
            inst_path=k['property'][sheet_file][value].strip('\"')
            print("{}|{}|{}".format(uuid, inst_name, inst_path))
    except:

        # When there is only one instance
        try:
            k = sch.sheet
            uuid = k['uuid']
            inst_name = k['property'][sheet_name][value].strip('\"')
            inst_path = k['property'][sheet_file][value].strip('\"')
            print("{}|{}|{}".format(uuid, inst_name, inst_path))

        except:
            # When there is no instances at all
            pass

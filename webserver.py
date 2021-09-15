#!/usr/bin/env python3

import argparse
import os
import shutil
import re
import sys
import signal

from http.server import SimpleHTTPRequestHandler

import webbrowser
import socketserver

from subprocess import PIPE, Popen
from typing import List, Tuple

prjctPath = None
httpd = None


class WebServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(
            *args,
            directory=os.path.realpath(os.path.join(prjctPath, "kidiff"), **kwargs)
        )

    def log_message(self, format, *args):
        return


def signal_handler(sig, frame):
    httpd.server_close()
    sys.exit(0)


def parse_cli_args():
    parser = argparse.ArgumentParser(description="Kicad PCB visual diffs.")
    parser.add_argument(
        "-d",
        "--display",
        type=str,
        help="Set DISPLAY value, default :1.0",
        default=":1.0",
    )
    parser.add_argument("-x", "--dir", type=str, help="Directory to serve")
    parser.add_argument(
        "-p", "--port", type=int, help="Set webserver port", default=9092
    )
    parser.add_argument(
        "-w",
        "--webserver-disable",
        action="store_true",
        help="Does not execute webserver (just generate images)",
    )
    parser.add_argument(
        "-v", "--verbose", action="count", default=0, help="Increase verbosity (-vvv)"
    )
    parser.add_argument(
        "kicad_pcb", metavar="PCB_PATH", nargs="?", help="Kicad PCB path"
    )

    args = parser.parse_args()

    if args.verbose >= 3:
        print("")
        print("Command Line Arguments")
        print(args)

    return args


def run_cmd(path: str, cmd: List[str]) -> Tuple[str, str]:

    p = Popen(
        cmd,
        stdin=PIPE,
        stdout=PIPE,
        stderr=PIPE,
        close_fds=True,
        encoding="utf-8",
        cwd=path,
    )

    stdout, stderr = p.communicate()
    p.wait()

    return stdout.strip("\n "), stderr


def get_kicad_project_path(prjctPath):
    """Returns the root folder of the repository"""

    cmd = ["git", "rev-parse", "--show-toplevel"]

    stdout, _ = run_cmd(prjctPath, cmd)
    repo_root_path = stdout.strip()

    kicad_project_path = os.path.relpath(prjctPath, repo_root_path)

    return repo_root_path, kicad_project_path


if __name__ == "__main__":

    signal.signal(signal.SIGINT, signal_handler)
    args = parse_cli_args()

    kicad_project_path = os.path.dirname(os.path.realpath(args.kicad_pcb))
    board_file = os.path.basename(os.path.realpath(args.kicad_pcb))

    prjctPath, kicad_project = get_kicad_project_path(kicad_project_path)

    if not args.webserver_disable:

        socketserver.TCPServer.allow_reuse_address = True
        request_handler = WebServerHandler
        httpd = socketserver.TCPServer(("", args.port), request_handler)

        with httpd:
            url = (
                "http://127.0.0.1:"
                + str(args.port)
                + "/"
                + kicad_project
                + "/"
                + "web/index.html"
            )
            print("")
            print("Starting webserver at {}".format(url))
            print("(Hit Ctrl+C to exit)")
            webbrowser.open(url)
            httpd.serve_forever()

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

wwwdir_path = None
httpd = None
default_port = 8080


class WebServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(
            *args, directory=os.path.realpath(wwwdir_path, **kwargs)
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
    parser.add_argument("-n", "--nested", action='store_true', help="Fix paths when it was a nested project")
    parser.add_argument(
        "-p", "--port", type=int, help="Force the weverver on an specific port"
    )
    parser.add_argument(
        "-r", "--port_range", type=int, default=10, help="Port range to try"
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
        "wwwdir", metavar="WWWDIR", help="A folder with web/index.html inside"
    )

    args = parser.parse_args()

    if args.verbose >= 3:
        print("")
        print("Command Line Arguments")
        print(args)

    return args

def launch_webserver(request_handler, port, kicad_project):

    global httpd
    httpd = socketserver.TCPServer(("", port), request_handler)

    with httpd:
        if args.nested:
            url = "http://127.0.0.1:{port}/{nested_project}/web/index.html".format(
                port=str(port),
                nested_project=kicad_project
            )
        else:
            url = "http://127.0.0.1:{port}/web/index.html".format(
                port=str(port)
            )

        print("")
        print("Starting webserver at {}".format(url))
        print("(Hit Ctrl+C to exit)")
        webbrowser.open(url)
        httpd.serve_forever()


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


if __name__ == "__main__":

    signal.signal(signal.SIGINT, signal_handler)
    args = parse_cli_args()

    if args.wwwdir:

        wwwdir_path = os.path.abspath(args.wwwdir)
        kicad_project = ".."

        # Assume it is running outside of the webserver the folder
        index_html = os.path.realpath(os.path.join(wwwdir_path, "web", "index.html"))
        if not os.path.exists(index_html):
            print("Could not find index.html")
            exit(1)

        if args.verbose:
            print("")
            print("wwwdir_path:", wwwdir_path)
            print("kicad_project:", kicad_project)
            print("index_html:", index_html)
            print("")

    else:
        print("WWWDIR is missing")
        exit(1)

    if not args.webserver_disable:

        socketserver.TCPServer.allow_reuse_address = True
        request_handler = WebServerHandler

    if args.port:
        try:
            launch_webserver(request_handler, args.port, kicad_project)
        except Exception:
            print("Specified port {port} is in use".format(port=port))
            pass
    else:
        for i in range(args.port_range):
            try:
                port = default_port + i
                launch_webserver(request_handler, port, kicad_project)
            except Exception:
                # print("Specified port {port} is in use".format(port=port))
                pass
        print("Specified ports are in use.")

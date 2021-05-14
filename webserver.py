#!/usr/bin/env python3

import argparse
import os
import shutil
import re
import sys
import signal
import webbrowser
import http.server
import socketserver

socketserver.TCPServer.allow_reuse_address = True
script_path = os.path.dirname(os.path.realpath(__file__))
assets_folder = os.path.join(script_path, "assets")

Handler = http.server.SimpleHTTPRequestHandler


class WebServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        pass
        super().__init__(
            *args,
            directory=os.path.realpath(
                os.path.join("/home/lheck/Dropbox/Documents/assoc-board", "kidiff")
            ),
            **kwargs
        )

    def log_message(self, format, *args):
        return


def startWebServer(port, project_path):
    with socketserver.TCPServer(("", port), WebServerHandler) as httpd:
        # url = 'http://127.0.0.1:' + str(port) + "/" + project_path + '/web/index.html'
        url = "http://127.0.0.1:" + str(port) + "/web/index.html"
        print("")
        print("Starting webserver at {}".format(url))
        print("(Hit Ctrl+C to exit)")
        webbrowser.open(url)
        httpd.serve_forever()


def signal_handler(sig, frame):
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

    args = parser.parse_args()

    if args.verbose >= 3:
        print("")
        print("Command Line Arguments")
        print(args)

    return args


if __name__ == "__main__":

    signal.signal(signal.SIGINT, signal_handler)
    args = parse_cli_args()

    project_path = "kidiff"
    if args.dir:
        project_path = args.dir

    if not args.webserver_disable:
        startWebServer(args.port, project_path)

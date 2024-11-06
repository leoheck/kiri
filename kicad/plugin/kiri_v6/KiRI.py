#!/usr/bin/env python

from __future__ import print_function
import pcbnew
import wx
import platform
import os
import sys
import shlex
import subprocess
import pathlib
import signal
import atexit
import io
import psutil

CREATE_NEW_PROCESS_GROUP = 0x00000200
DETACHED_PROCESS = 0x00000008


class KiRI(pcbnew.ActionPlugin):

    def defaults(self):
        self.name = "Kicad Revision Inspector (KiRI)"
        self.category = "Revision"
        self.description = "Kicad Revision Inspector"
        self.show_toolbar_button = True
        self.icon_file_name = os.path.join(os.path.dirname(__file__), "./kiri.png")

        self.processes = []

    def which(self, program):
        import os
        def is_exe(fpath):
            return os.path.isfile(fpath) and os.access(fpath, os.X_OK)

        fpath, fname = os.path.split(program)
        if fpath:
            if is_exe(program):
                return program
        else:
            for path in os.environ.get("PATH", "").split(os.pathsep):
                exe_file = os.path.join(path, program)
                if is_exe(exe_file):
                    return exe_file

        return None

    def Run(self):

        # wx.MessageBox("Starting Kiri")

        for proc in psutil.process_iter():
            if proc.name() == "kiri":
                print("killing old kiri")
                proc.kill()
            if proc.name() == "kiri-server":
                print("killing old kiri-server")
                proc.kill()


        print("======================================")

        kiri_bin = "kiri"

        if self.which(kiri_bin) == None:
            print("Warning: {} is not in the path, check your environment.".format(kiri_bin))
            return

        self.exit_handler()

        atexit.register(self.exit_handler)

        try:
            project_path = os.environ.get('KIPRJMOD')
            board = pcbnew.GetBoard()
            project_name = str(os.path.basename(board.GetFileName())).replace(".kicad_pcb", ".kicad_pro")
            project_file_path = os.path.join(project_path, project_name)
            cmd = "{kiri} -t 2 -r -R -V -l {pro}".format(kiri=kiri_bin, pro=project_file_path)
        except:
            cmd = "{kiri} -t 2 -r -R -V -l".format(kiri=kiri_bin)

        print(cmd)
        cmd = shlex.split(cmd)

        kwargs = {}
        if platform.system() == 'Windows':
            CREATE_NEW_PROCESS_GROUP = 0x00000200  # note: could get it from subprocess
            DETACHED_PROCESS = 0x00000008          # 0x8 | 0x200 == 0x208
            kwargs.update(creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP)
        elif sys.version_info < (3, 2):  # assume posix
            kwargs.update(preexec_fn=os.setsid)
        else:  # Python 3.2+ and Unix
            kwargs.update(start_new_session=True)

        p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs)
        print("pid={}".format(p.pid))
        # self.processes.append(p)
        # assert not process.poll()
        for line in io.TextIOWrapper(p.stdout, encoding="utf-8"):
            print(line, end="")
        p.stdout.close()
        p.wait()

        print("\nLaunching kiri-server (may take some time)...")
        cmd = "{kiri} -t 2 -r -R -u &".format(kiri=kiri_bin)
        print(cmd)
        cmd = shlex.split(cmd)

        p2 = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs)
        print("pid={}".format(p2.pid))
        # result, error = p2.communicate()
        # print(result.decode('utf-8'))
        # print(error.decode('utf-8'))
        if p2:
            self.processes.append(p2)
        # p2.wait()


        print("\nDONE...")
        # return


    def exit_handler(self):
        if self.processes:
            for p in self.processes:
                if not p.poll():
                    print("\n>>> Terminating old KiRI process (pid={})<<<".format(p.pid))
                    try:
                        os.killpg(os.getpgid(p.pid), signal.SIGTERM)
                    except:
                        pass

                self.processes.remove(p)


KiRI().register()

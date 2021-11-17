
from __future__ import print_function
import pcbnew
import wx
import os
import subprocess
import pathlib

class KDiff(pcbnew.ActionPlugin):

    def defaults(self):
        self.name = "KDiff"
        self.category = "Review"
        self.description = "Visuall Diff Inspector"
        self.icon_file_name = os.path.join(os.path.dirname(__file__), "./kdiff.png")
        self.show_toolbar_button = True

    def Run(self):

        try:
            project_path = os.environ.get('KIPRJMOD')
            board = pcbnew.GetBoard()
            project_name = str(os.path.basename(board.GetFileName())).replace(".kicad_pcb", ".pro")
            project_file_path = os.path.join(project_path, project_name)
            cmd = ['kdiff', project_file_path]
        except:
            cmd = [kdiff]

        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        #print(stdout)
        #print(stderr)

KDiff().register()

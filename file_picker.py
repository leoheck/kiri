#!/usr/bin/env python3

# sudo apt-get install python3-tk 

import pathlib
from tkinter import *
from tkinter import ttk
from tkinter.filedialog import askopenfilename

filetypes = [ 
    ("Kicad Project", "*.pro"), 
    ("All Files", "*.*")
]


def select_file(current_path):

    filename = askopenfilename(
        initialdir=current_path,
        filetypes=filetypes,
        title="Kdiff - Select Kicad project file",
    )

    print(filename)


if __name__ == "__main__":

    Tk().withdraw()
    current_path = pathlib.Path().absolute()
    select_file(current_path)

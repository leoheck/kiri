
from __future__ import print_function
import pprint
import traceback
import sys

print("Starting KiRI plugin")

try:
    from kiri import *
except Exception as e:
    traceback.print_exc(file=sys.stdout)
    pprint.pprint(e)


from __future__ import print_function
import pprint
import traceback
import sys

try:
    print("Starting KiRI")
    from kiri import KiRI

except Exception as e:
    traceback.print_exc(file=sys.stdout)
    pprint.pprint(e)

#! /usr/bin/env python
"""
maskfunctions.py
Mask functions for filtering airline delay data

Created by Jeremy Smith on 2017-06-09
j.smith.03@cantab.net
"""

import sys
import numpy as np
import pandas as pd
import itertools as it


def create_mask(df, airports, carrier, month, dotw):
    """Creates a filter for delay dataframe"""
    if type(airports) is tuple:
        mask = (df.Origin == airports[0]) & (df.Dest == airports[1])
    elif type(airports) is str or type(airports) is unicode:
        mask = (df.Origin == airports)
    elif type(airports) is np.ndarray:
        mask = (df.Origin.isin(airports))
    else:
        print "Warning: incorrect airports data type (must be tuple(2) or string or ndarray)"
        mask = (df.Origin == airports)

    if carrier is not 'ALL':
        mask = mask & (df.Carrier == carrier)
    if month is not 0:
        mask = mask & (df.Month == month)
    if dotw is not 0:
        mask = mask & (df.DayOfWeek == dotw)

    if not np.any(mask):
        print "Warning: no data for this combination"

    matches = mask.sum()

    return mask, matches

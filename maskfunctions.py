#! /usr/bin/env python
"""
maskfunctions.py
Mask functions for filtering airline delay data

Created by Jeremy Smith on 2017-06-09
j.smith.03@cantab.net
"""

import numpy as np
import pandas as pd
import itertools as it


def create_mask(df, airports, carrier, month, dotw, warning=10):
    """
    Creates a filter for delay dataframe
    - df      : pandas dataframe to filter
    - airports: 3 lettter IATA codes as a tuple for a route, a string for a single airport,
                or an array for several airports
    - carrier : 2 letter code for airline or 'ALL' for all airlines
    - month   : number for month (1 - 12), or 0 for all months, or 'SPR', 'SUM', 'FAL', 'WIN'
                for the seasons
    - dotw    : number for day of the week (1 - 7), or 0 for all days, or 'WD' for weekday,
                or 'WE' for weekend
    """
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
        if month == 'SPR':
            mask = mask & ((df.Month == 3) | (df.Month == 4) | (df.Month == 5))
        elif month == 'SUM':
            mask = mask & ((df.Month == 6) | (df.Month == 7) | (df.Month == 8))
        elif month == 'FAL':
            mask = mask & ((df.Month == 9) | (df.Month == 10) | (df.Month == 11))
        elif month == 'WIN':
            mask = mask & ((df.Month == 12) | (df.Month == 1) | (df.Month == 2))
        else:
            mask = mask & (df.Month == month)
    if dotw is not 0:
        if dotw == 'WD':
            mask = mask & np.bitwise_not((df.DayOfWeek == 6) | (df.DayOfWeek == 7))
        elif dotw == 'WE':
            mask = mask & ((df.DayOfWeek == 6) | (df.DayOfWeek == 7))
        else:
            mask = mask & (df.DayOfWeek == dotw)

    if not np.any(mask):
        print "Warning: no data for this combination"
        return mask, 0

    matches = mask.sum()
    if matches < warning:
        print "Warning: number of matches is less than {:d}".format(warning)

    return mask, matches

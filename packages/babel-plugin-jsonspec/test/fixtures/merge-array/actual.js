import { tuple, array, string, boolean, merge } from 'jsonspec'

const check = merge(tuple(string, string), array(boolean))

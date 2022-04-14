import { tuple, array, string, boolean, merge } from 'spectypes'

const check = merge(tuple(string, string), array(boolean))

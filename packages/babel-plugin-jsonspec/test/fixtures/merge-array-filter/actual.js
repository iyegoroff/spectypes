import { tuple, array, string, boolean, merge, filter } from 'jsonspec'

const check = merge(tuple(string, string), array(filter(boolean, x => x)))

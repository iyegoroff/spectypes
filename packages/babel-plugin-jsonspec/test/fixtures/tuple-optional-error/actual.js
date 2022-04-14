import { tuple, number, string, boolean, optional, filter } from 'jsonspec'

const check = tuple(number, optional(string), filter(boolean, x => x))

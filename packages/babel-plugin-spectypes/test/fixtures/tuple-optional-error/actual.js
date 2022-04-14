import { tuple, number, string, boolean, optional, filter } from 'spectypes'

const check = tuple(number, optional(string), filter(boolean, x => x))

import { tuple, number, string, boolean } from 'jsonspec'

const check = tuple(number, string, boolean)

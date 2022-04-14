import { union, number, string, boolean, unknown } from 'jsonspec'

const check = union(number, string, boolean, unknown)

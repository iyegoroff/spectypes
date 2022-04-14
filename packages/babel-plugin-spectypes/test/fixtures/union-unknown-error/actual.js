import { union, number, string, boolean, unknown } from 'spectypes'

const check = union(number, string, boolean, unknown)

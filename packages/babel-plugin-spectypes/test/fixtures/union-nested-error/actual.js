import { union, number, string, boolean } from 'spectypes'

const check = union(number, union(string, boolean))

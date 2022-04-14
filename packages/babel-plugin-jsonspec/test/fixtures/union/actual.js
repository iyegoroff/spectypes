import { union, number, string, boolean } from 'jsonspec'

const check = union(number, string, boolean)

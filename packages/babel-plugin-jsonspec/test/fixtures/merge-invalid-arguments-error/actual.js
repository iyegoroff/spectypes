import { optional, record, number, string, boolean, merge } from 'jsonspec'

const check = merge(optional(number), record(string, boolean))

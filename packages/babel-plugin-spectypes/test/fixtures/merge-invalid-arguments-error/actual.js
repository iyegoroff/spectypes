import { optional, record, number, string, boolean, merge } from 'spectypes'

const check = merge(optional(number), record(string, boolean))

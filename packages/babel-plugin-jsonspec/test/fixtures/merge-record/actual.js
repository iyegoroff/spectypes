import { object, record, number, string, boolean, merge } from 'jsonspec'

const check = merge(object({ x: number }), record(string, boolean))

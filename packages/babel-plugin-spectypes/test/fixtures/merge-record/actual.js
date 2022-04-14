import { object, record, number, string, boolean, merge } from 'spectypes'

const check = merge(object({ x: number }), record(string, boolean))

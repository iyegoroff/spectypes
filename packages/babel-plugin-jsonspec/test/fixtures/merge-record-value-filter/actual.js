import { object, record, number, string, boolean, merge, filter } from 'jsonspec'

const check = merge(object({ x: number }), record(string, filter(boolean, x => x)))

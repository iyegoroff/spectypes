import { object, record, number, string, boolean, merge, filter } from 'spectypes'

const check = merge(object({ x: number }), record(string, filter(boolean, x => x)))

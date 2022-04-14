import { object, record, number, string, boolean, merge, filter } from 'spectypes'

const check = merge(object({ x: number }), record(filter(string, x => x.length > 5), filter(boolean, x => x)))

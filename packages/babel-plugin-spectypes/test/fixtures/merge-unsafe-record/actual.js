import { object, UNSAFE_record, number, string, boolean, merge } from 'spectypes'

const check = merge(object({ x: number }), UNSAFE_record(string, boolean))

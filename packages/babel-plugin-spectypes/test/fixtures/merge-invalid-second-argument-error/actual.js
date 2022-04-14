import { record, number, string, boolean, merge } from 'spectypes'

const check = merge(record(string, boolean), ...number)

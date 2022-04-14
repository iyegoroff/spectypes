import { record, number, string, boolean, merge } from 'jsonspec'

const check = merge(record(string, boolean), ...number)

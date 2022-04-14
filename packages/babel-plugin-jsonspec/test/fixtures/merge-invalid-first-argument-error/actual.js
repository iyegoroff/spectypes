import { record, number, string, boolean, merge } from 'jsonspec'

const check = merge(...number, record(string, boolean))

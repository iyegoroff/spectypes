import { record, number, string, boolean, merge } from 'spectypes'

const check = merge(...number, record(string, boolean))

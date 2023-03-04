import { record, string, number } from 'spectypes'

const Key = string
const Value = number

const check = record(Key, Value)

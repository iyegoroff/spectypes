import { record, string } from 'spectypes'

const Key = string

const check = record(Key, string)

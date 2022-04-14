import { record, optional, number, string } from 'spectypes'

const check = record(string, optional(number))

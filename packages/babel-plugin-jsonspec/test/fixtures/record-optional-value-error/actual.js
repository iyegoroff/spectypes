import { record, optional, number, string } from 'jsonspec'

const check = record(string, optional(number))

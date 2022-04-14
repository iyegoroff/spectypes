import { record, optional, number } from 'jsonspec'

const check = record(optional(number))

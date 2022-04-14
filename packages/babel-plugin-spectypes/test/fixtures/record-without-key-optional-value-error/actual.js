import { record, optional, number } from 'spectypes'

const check = record(optional(number))

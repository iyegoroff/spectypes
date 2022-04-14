import { record, array, number, string } from 'jsonspec'

const check = record(array(number), string)

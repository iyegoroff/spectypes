import { record, array, number, string } from 'spectypes'

const check = record(array(number), string)

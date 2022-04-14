import { record, string, boolean, filter } from 'jsonspec'

const check = record(string, filter(boolean, x => x))

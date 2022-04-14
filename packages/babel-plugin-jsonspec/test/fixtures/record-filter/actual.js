import { record, string, boolean, filter } from 'jsonspec'

const check = record(filter(string, x => x.length > 5), filter(boolean, x => x))

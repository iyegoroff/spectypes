import { record, boolean, filter } from 'jsonspec'

const check = record(filter(boolean, x => x))

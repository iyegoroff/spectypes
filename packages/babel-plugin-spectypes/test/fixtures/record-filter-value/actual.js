import { record, string, boolean, filter } from 'spectypes'

const check = record(string, filter(boolean, x => x))

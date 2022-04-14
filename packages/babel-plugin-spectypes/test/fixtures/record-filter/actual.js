import { record, string, boolean, filter } from 'spectypes'

const check = record(filter(string, x => x.length > 5), filter(boolean, x => x))

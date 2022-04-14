import { record, boolean, filter } from 'spectypes'

const check = record(filter(boolean, x => x))

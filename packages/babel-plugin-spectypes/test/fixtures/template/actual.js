import { template, literal, number, string, boolean } from 'spectypes'

const check = template(literal('test'), string, number, boolean)

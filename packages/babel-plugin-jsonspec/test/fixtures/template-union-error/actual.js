import { template, union, tuple } from 'jsonspec'

const check = template(union(tuple()))

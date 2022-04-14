import { template, union, tuple } from 'spectypes'

const check = template(union(tuple()))

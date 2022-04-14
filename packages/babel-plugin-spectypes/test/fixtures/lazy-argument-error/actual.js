import { lazy, string, union } from 'spectypes'

const check = lazy(function foo() { return union(string, check) })

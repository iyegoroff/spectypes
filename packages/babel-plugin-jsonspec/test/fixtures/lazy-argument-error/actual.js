import { lazy, string, union } from 'jsonspec'

const check = lazy(function foo() { return union(string, check) })

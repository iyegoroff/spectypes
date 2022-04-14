import { lazy, string, union } from 'jsonspec'

const check = lazy(() => { return union(string, check) })

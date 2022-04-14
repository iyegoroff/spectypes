import { lazy, string, union } from 'spectypes'

const check = lazy(() => { return union(string, check) })

import { lazy, string, filter, object, array, validator } from 'jsonspec'

const person = lazy(() => filter(object({ name: string, likes: array(validator(person)) })))

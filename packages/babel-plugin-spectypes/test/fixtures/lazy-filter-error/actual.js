import { lazy, string, filter, object, array, validator } from 'spectypes'

const person = lazy(() => filter(object({ name: string, likes: array(validator(person)) })))

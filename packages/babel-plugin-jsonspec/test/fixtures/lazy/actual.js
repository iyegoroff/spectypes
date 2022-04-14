import { lazy, string, object, array, validator } from 'jsonspec'

const person = lazy(() => object({ name: string, likes: array(validator(person)) }))

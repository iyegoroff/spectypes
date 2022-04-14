import { lazy, string, object, array, validator } from 'spectypes'

const person = lazy(() => object({ name: string, likes: array(validator(person)) }))

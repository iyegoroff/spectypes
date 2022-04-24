import { unknown, map, limit } from 'spectypes'

const check = map(
  limit(unknown, x => !isNaN(Date.parse(x))),
  x => new Date(x)
)

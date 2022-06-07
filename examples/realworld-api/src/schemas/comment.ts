import { limit, number, string, struct, transformer } from 'spectypes'
import { isDateFormat } from '../util.js'
import { checkProfile } from './profile.js'

export const checkComment = struct({
  author: transformer(checkProfile),
  body: string,
  createdAt: limit(string, isDateFormat),
  updatedAt: limit(string, isDateFormat),
  id: number
})

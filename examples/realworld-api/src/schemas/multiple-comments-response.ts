import { array, struct, transformer } from 'spectypes'
import { checkComment } from './comment.js'

export const checkMultipleCommentsResponse = struct({
  comments: array(transformer(checkComment))
})

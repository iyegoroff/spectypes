import { struct, transformer } from 'spectypes'
import { checkComment } from './comment.js'

export const checkSingleCommentResponse = struct({
  comment: transformer(checkComment)
})

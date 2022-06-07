import { struct, transformer } from 'spectypes'
import { checkArticle } from './article.js'

export const checkSingleArticleResponse = struct({
  article: transformer(checkArticle)
})

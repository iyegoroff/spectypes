import { array, number, struct, transformer } from 'spectypes'
import { checkArticle } from './article.js'

export const checkMultipleArticlesResponse = struct({
  articlesCount: number,
  articles: array(transformer(checkArticle))
})

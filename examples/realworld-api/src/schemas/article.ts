import { array, boolean, limit, nullish, number, string, struct, union } from 'spectypes'
import { isDateFormat } from '../util.js'

export const checkArticle = struct({
  author: struct({
    bio: union(string, nullish),
    following: boolean,
    image: union(string, nullish),
    username: string
  }),
  body: string,
  createdAt: limit(string, isDateFormat),
  description: string,
  favorited: boolean,
  favoritesCount: number,
  slug: string,
  tagList: array(string),
  title: string,
  updatedAt: limit(string, isDateFormat)
})

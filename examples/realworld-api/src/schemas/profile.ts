import { boolean, nullish, string, struct, union } from 'spectypes'

export const checkProfile = struct({
  username: string,
  bio: union(string, nullish),
  image: union(string, nullish),
  following: boolean
})

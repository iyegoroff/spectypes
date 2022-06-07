import { nullish, string, struct, union } from 'spectypes'

export const checkUserResponse = struct({
  user: struct({
    bio: union(string, nullish),
    email: string,
    image: union(string, nullish),
    token: string,
    username: string
  })
})

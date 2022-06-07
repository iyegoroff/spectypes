import { array, string, struct } from 'spectypes'

export const checkTagsResponse = struct({
  tags: array(string)
})

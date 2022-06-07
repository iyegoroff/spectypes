import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkTagsResponse } from '../schemas/tags-response.js'
import { fetchmap, url } from '../util.js'

export const getTags = () =>
  fetchmap(
    {
      ok: { json: checkTagsResponse },
      notOk: { json: checkGenericError }
    },
    url(`tags`)
  )

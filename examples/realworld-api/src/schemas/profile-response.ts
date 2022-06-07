import { struct, transformer } from 'spectypes'
import { checkProfile } from './profile.js'

export const checkProfileResponse = struct({
  profile: transformer(checkProfile)
})

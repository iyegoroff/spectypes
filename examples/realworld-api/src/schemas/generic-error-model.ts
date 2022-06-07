import { array, optional, record, string, struct, union } from 'spectypes'

export const checkGenericError = union(struct({ errors: optional(record(array(string))) }), string)

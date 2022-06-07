export const contentTypeApplicationJson = { 'Content-Type': 'application/json' } as const

export const authorization = (token: string) => ({ authorization: `Token ${token}` } as const)

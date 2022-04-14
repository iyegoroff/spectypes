import { object, number, string, boolean, writable } from 'spectypes'

const check = writable(...object({ x: number, y: string, z: boolean }))

import { object, number, string, boolean, writable } from 'jsonspec'

const check = writable(...object({ x: number, y: string, z: boolean }))

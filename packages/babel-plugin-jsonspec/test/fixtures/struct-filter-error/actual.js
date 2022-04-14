import { struct, number, string, boolean, filter } from 'jsonspec'

const check = struct({ x: filter(number, x => x), y: string, z: boolean })

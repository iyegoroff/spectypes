import { struct, number, string, boolean } from 'jsonspec'

const check = struct({ x: number, y: string, z: boolean })

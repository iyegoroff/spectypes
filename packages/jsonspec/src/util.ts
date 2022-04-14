// source: https://github.com/sindresorhus/escape-string-regexp/blob/v4.0.0/index.js
export const escapeRegexp = (str: string) =>
  str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')

// source: https://github.com/pelotom/runtypes/blob/v6.5.0/src/types/template.ts
export const numberTest =
  '(?:(?:[+-]?(?:\\d*\\.\\d+|\\d+\\.\\d*|\\d+)(?:[Ee][+-]?\\d+)?)|(?:0[Bb][01]+)|(?:0[Oo][0-7]+)|(?:0[Xx][0-9A-Fa-f]+))'

export const stringTest = '.*'

export const booleanTest = '(?:true|false)'

export const bannedKeys = Object.getOwnPropertyNames(Object.prototype)

export const error = () => {
  throw new Error(`spectypes validators have to be processed with 'babel-plugin-spectypes'`)
}

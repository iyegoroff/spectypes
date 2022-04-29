import { readFileSync } from 'fs'
import path from 'path'
import { string, struct } from 'spectypes'
import { Result } from 'ts-railway'

const versionCheck = struct({ version: string, name: string })

const version = (packagePath: string) =>
  Result.match(
    {
      success: (pack) => `${pack.name}@${pack.version}`,
      failure: (fail) => {
        throw new Error(JSON.stringify(fail))
      }
    },
    versionCheck(JSON.parse(readFileSync(path.join(__dirname, packagePath)).toString()) as unknown)
  )

export const spectypesVersion = version('../../packages/spectypes/package.json')

export const ajvVersion = version('../node_modules/ajv/package.json')

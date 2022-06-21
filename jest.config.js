const projects = ['packages/babel-plugin-spectypes', 'packages/spectypes-plugin-core']

const config = {
  moduleFileExtensions: ['js', 'ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'test/'],
  testPathIgnorePatterns: ['blueprint-templates'],
  testRegex: '\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': process.env.CI ? 'ts-jest' : '@swc/jest'
  },
  moduleNameMapper: {
    '(.*)\\.js$': '$1'
  },
}

module.exports = {
  coverageDirectory: 'coverage',
  collectCoverage: true,
  testEnvironment: 'node',
  projects: projects.map((dir) => ({
    displayName: dir,
    rootDir: dir,
    ...config
  }))
}

const config = {
  schemaFile: 'http://localhost:3001/openapi.json',
  apiFile: './src/lib/api/emptyApi.ts',
  apiImport: 'emptySplitApi',
  outputFile: './src/lib/api/generatedApi.ts',
  exportName: 'api',
  hooks: true,
  tag: true,
};

module.exports = config;

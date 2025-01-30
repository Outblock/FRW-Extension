import * as fs from 'fs';

const sourceFile = 'src/shared/test-data/api-test-results.ts';
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

// Extract all test groups
const groups = sourceContent.match(/^\s\s(\w+):\s*(\[(.*?\n)*?\s\s\])/g) || [];

// Create individual files for each group
groups.forEach((group) => {
  const groupName = group.match(/^(\w+):/)?.[1];
  if (!groupName) return;

  const fileName = `src/shared/test-data/api-test-${groupName.toLowerCase()}-results.ts`;
  const content = `import { INITIAL_OPENAPI_URL, WEB_NEXT_URL } from '@/constant';
import { type ApiTestResult } from './api-test-results-types';

export const ${groupName}TestResults: ApiTestResult[] = ${group.replace(/^[^[]+/, '')};
`;

  fs.writeFileSync(fileName, content);
});

// // Update the main file
// const mainFileContent = `import { INITIAL_OPENAPI_URL, WEB_NEXT_URL } from '@/constant';

// ${groups
//   .map(([groupName, _group]) => {
//     return `import { ${groupName}TestResults } from './api-test-${groupName.toLowerCase()}-results';`;
//   })
//   .join('\n')}
// import { type ApiTestResults } from './api-test-results-types';

// export const createTestResults = (): ApiTestResults => ({
// ${groups
//   .map(([groupName, _group]) => {
//     return `  ${groupName}: ${groupName}TestResults,`;
//   })
//   .join('\n')}
// });
// `;

//fs.writeFileSync(sourceFile, mainFileContent);

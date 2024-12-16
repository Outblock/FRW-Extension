const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class ImportAnalyzer {
  constructor() {
    this.imports = new Map(); // package -> Set of files using it
    this.packageLocations = {
      background: new Set(),
      ui: new Set(),
      content: new Set(),
    };
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);

    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      traverse(ast, {
        ImportDeclaration: (path) => {
          const importPath = path.node.source.value;

          // Only analyze external packages (not relative imports)
          if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
            const packageName = importPath.startsWith('@')
              ? importPath.split('/').slice(0, 2).join('/')
              : importPath.split('/')[0];

            if (!this.imports.has(packageName)) {
              this.imports.set(packageName, new Set());
            }
            this.imports.get(packageName).add(relativePath);

            // Categorize by location
            if (relativePath.includes('background/')) {
              this.packageLocations.background.add(packageName);
            } else if (relativePath.includes('ui/')) {
              this.packageLocations.ui.add(packageName);
            } else if (relativePath.includes('content/')) {
              this.packageLocations.content.add(packageName);
            }
          }
        },
        CallExpression(path) {
          // Check for require() calls
          if (path.node.callee.name === 'require') {
            const arg = path.node.arguments[0];
            if (arg && arg.type === 'StringLiteral') {
              const importPath = arg.value;
              if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
                const packageName = importPath.startsWith('@')
                  ? importPath.split('/').slice(0, 2).join('/')
                  : importPath.split('/')[0];

                if (!this.imports.has(packageName)) {
                  this.imports.set(packageName, new Set());
                }
                this.imports.get(packageName).add(relativePath);

                // Categorize by location
                if (relativePath.includes('background/')) {
                  this.packageLocations.background.add(packageName);
                } else if (relativePath.includes('ui/')) {
                  this.packageLocations.ui.add(packageName);
                } else if (relativePath.includes('content/')) {
                  this.packageLocations.content.add(packageName);
                }
              }
            }
          }
        },
      });
    } catch (error) {
      console.warn(`Failed to parse ${relativePath}:`, error.message);
    }
  }

  generateReport() {
    let report = '# Dependency Usage Analysis\n\n';
    report += `> Generated on ${new Date().toLocaleString()}\n\n`;

    // Summary by location
    report += '## Package Usage by Location\n\n';
    Object.entries(this.packageLocations).forEach(([location, packages]) => {
      report += `### ${location.charAt(0).toUpperCase() + location.slice(1)}\n\n`;
      Array.from(packages)
        .sort()
        .forEach((pkg) => {
          const usageCount = this.imports.get(pkg).size;
          report += `- \`${pkg}\` (${usageCount} ${usageCount === 1 ? 'file' : 'files'})\n`;
        });
      report += '\n';
    });

    // Detailed usage
    report += '## Detailed Package Usage\n\n';
    Array.from(this.imports.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([pkg, files]) => {
        report += `### \`${pkg}\`\n\n`;
        Array.from(files)
          .sort()
          .forEach((file) => {
            report += `- ${file}\n`;
          });
        report += '\n';
      });

    return report;
  }
}

// Run the analysis
console.log('Starting import analysis...');
const analyzer = new ImportAnalyzer();

// Find all TypeScript and JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/dist/**'],
});

files.forEach((file) => {
  analyzer.analyzeFile(file);
});

const report = analyzer.generateReport();
fs.writeFileSync('dependency-usage.md', report);
console.log('Analysis complete! Check dependency-usage.md');

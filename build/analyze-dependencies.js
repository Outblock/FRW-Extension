const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config.js');

class DependencyAnalyzer {
  constructor() {
    this.dependencies = {
      background: new Set(),
      ui: new Set(),
      content: new Set(),
      shared: new Set(),
    };
  }

  analyzeDependencies(stats) {
    const modules = new Map();

    // Use compilation.modules instead of chunk.getModules()
    stats.compilation.modules.forEach((module) => {
      if (!module.resource || !module.resource.includes('node_modules')) {
        return;
      }

      const pkg = module.resource.split('node_modules/')[1].split('/')[0];
      const chunks = Array.from(module.chunksIterable || []);

      chunks.forEach((chunk) => {
        const target = chunk.name?.includes('background')
          ? 'background'
          : chunk.name?.includes('ui')
            ? 'ui'
            : chunk.name?.includes('content')
              ? 'content'
              : null;

        if (target) {
          if (!modules.has(pkg)) {
            modules.set(pkg, new Set());
          }
          modules.get(pkg).add(target);
        }
      });
    });

    // Categorize dependencies
    modules.forEach((targets, pkg) => {
      if (targets.size > 1) {
        this.dependencies.shared.add(pkg);
      } else {
        const [target] = targets;
        this.dependencies[target].add(pkg);
      }
    });

    return this;
  }

  generateReport() {
    let report = '# Extension Dependencies Analysis\n\n';
    report += `> Generated on ${new Date().toLocaleString()}\n\n`;

    // Add summary
    report += '## Summary\n\n';
    Object.entries(this.dependencies).forEach(([target, deps]) => {
      report += `- **${target}**: ${deps.size} packages\n`;
    });
    report += '\n';

    // Add detailed lists
    Object.entries(this.dependencies).forEach(([target, deps]) => {
      report += `## ${target.charAt(0).toUpperCase() + target.slice(1)} Dependencies\n\n`;
      if (deps.size === 0) {
        report += '_No dependencies_\n\n';
      } else {
        Array.from(deps)
          .sort()
          .forEach((dep) => {
            report += `- \`${dep}\`\n`;
          });
        report += '\n';
      }
    });

    return report;
  }
}

// Prepare build environment
console.log('Preparing build environment...');

// Copy manifest
fs.copyFileSync(
  path.join(__dirname, '../_raw/manifest/manifest.dev.json'),
  path.join(__dirname, '../_raw/manifest.json')
);

// Clean dist directory
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
} else {
  fs.rmSync(distPath, { recursive: true });
  fs.mkdirSync(distPath);
}

// Copy _raw contents to dist
fs.cpSync(path.join(__dirname, '../_raw'), distPath, { recursive: true });

// Get webpack config using the same configuration as build:dev
const config = webpackConfig({ config: 'dev' });

// Run the analysis
console.log('Starting webpack build and analysis...');
const analyzer = new DependencyAnalyzer();

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('Build failed:', err || stats.toString());
    process.exit(1);
  }

  console.log('Build complete, analyzing dependencies...');
  const report = analyzer.analyzeDependencies(stats).generateReport();

  const reportPath = path.join(__dirname, '../extension-dependencies.md');
  fs.writeFileSync(reportPath, report);
  console.log(`Analysis complete! Check ${reportPath}`);
});

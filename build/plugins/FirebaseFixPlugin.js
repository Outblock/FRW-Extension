// FirebaseFixPlugin.js
class FirebaseFixPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('FirebaseFixPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'FirebaseFixPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY,
        },
        (assets) => {
          for (const [name, asset] of Object.entries(assets)) {
            if (/\.(js|jsx)$/.test(name)) {
              let content = asset.source();

              console.log('About to fix firebase stuff', name);
              console.log('typeof content', typeof content);

              // Replace the _loadJS function
              content = content.replace(
                /function\s*\w*\s*_loadJS\([\w\s,]*\)\s*\{([\w\W]*?)\}$/gim,
                'function _loadJS() { return Promise.resolve(); };'
              );

              // Replace the Google reCAPTCHA string
              content = content.replace(
                /https:\/\/www\.google\.com\/recaptcha\/(enterprise|api)\.js(\?render=)?/g,
                ''
              );

              content = content.replace(
                /_loadJS\(`https:\/\/apis\.google\.com\/js\/api\.js(\?onload=\$\{([^}]+)\})?`\)/g,
                '_loadJS(`${$1}`)'
              );

              content = content.replace(
                /\(`https:\/\/apis\.google\.com\/js\/api\.js(\?onload=\$\{t\})?`\)/g,
                '(`${t}`)'
              );

              compilation.updateAsset(name, new compiler.webpack.sources.RawSource(content));
            }
          }
        }
      );
    });
  }
}

module.exports = FirebaseFixPlugin;

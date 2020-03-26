const { writeFileSync, existsSync, mkdirSync } = require("fs");
const { extname, resolve, relative } = require("path");
const { load } = require("parcel-bundler/lib/utils/config");

const entryHTML = (entry, info = {}) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${info.title || info.name || ""}</title>
  ${
    info.description
      ? `<meta name="description" content="${info.description || ""}">`
      : ""
  }
</head>
<body>
  <noscript>
    We're sorry but ${info.title ||
      info.name ||
      ""} doesn't work properly without JavaScript enabled. Please enable it to continue.
  </noscript>
  <div id="app"></div>
  <script src="${entry}"></script>
</body>
</html>
`;

module.exports = bundler => {
  bundler.entryFiles.forEach(async (entry, index) => {
    const extension = extname(entry);
    const parser = bundler.parser.extensions[extension];

    if (parser !== "./assets/JSAsset") return;

    const { cacheDir } = bundler.options;
    const config = await load(entry, ["package.json"]);
    const jsPath = relative(cacheDir, entry);
    const htmlPath = resolve(cacheDir, "index.html");
    const html = entryHTML(jsPath, config);
    if (!existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    writeFileSync(htmlPath, html);

    bundler.entryFiles[index] = htmlPath;
    bundler.options.rootDir = cacheDir;
  });
};

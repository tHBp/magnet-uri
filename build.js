const zlib = require("zlib");
const path = require("path");
const fs = require("fs-extra");
const minify = require("html-minifier").minify;
const crypto = require("crypto");

const outputFolder = path.join("./", "dist");

const computeHash = content => `sha512-${crypto.createHash("sha512").update(content, "utf8").digest("base64")}`;

async function compress(filename, outputFolder) {
    outputFolder = outputFolder || "./";
    return new Promise((resolve, reject) => {
        const compress = zlib.createBrotliCompress({
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11
            }
        });
        const input = fs.createReadStream(filename);
        const output = fs.createWriteStream(path.join(outputFolder, filename +".br"));

        input.pipe(compress).pipe(output);
        output.on("finish", () => {
            resolve();
        });
        output.on("error", ex => {
            reject(ex);
        });
    });
}

(async () => {
    await fs.emptyDir(outputFolder);
    await Promise.all([
        fs.copy("src", outputFolder),
        fs.copy("_redirects", path.join(outputFolder, "_redirects"))
    ]);
    const result = minify(await fs.readFile("./src/index.html", "utf8"), {
        removeAttributeQuotes: true,
        minifyCSS: true,
        minifyJS: true,
        collapseWhitespace: true
    });
    const styleHash = computeHash(result.match("<style>(.*)</style>")[1]);
    const scriptHash = computeHash(result.match("<script>(.*)</script>")[1]);
    const headers = await fs.readFile("_headers", "utf8");
    await Promise.all([
        fs.writeFile(path.join(outputFolder, "_headers"), headers.replace("__STYLE_HASH__", styleHash).replace("__SCRIPT_HASH__", scriptHash)),
        fs.writeFile(path.join(outputFolder, "index.html"), result)
    ]);
    await compress(path.join(outputFolder, "index.html"));
})();
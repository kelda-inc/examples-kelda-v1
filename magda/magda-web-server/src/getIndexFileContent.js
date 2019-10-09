"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const getStaticStyleSheetFileName_1 = require("./getStaticStyleSheetFileName");
function getIndexFileContent(clientRoot, useLocalStyleSheet) {
    const indexFileContent = fs.readFileSync(path.join(clientRoot, "build/index.html"), {
        encoding: "utf-8"
    });
    if (useLocalStyleSheet) {
        const cssFileName = getStaticStyleSheetFileName_1.default(clientRoot);
        return indexFileContent.replace("/api/v0/content/stylesheet.css", `/static/css/${cssFileName}`);
    }
    return indexFileContent;
}
exports.default = getIndexFileContent;
//# sourceMappingURL=getIndexFileContent.js.map
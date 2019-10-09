"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function getStaticStyleSheetFileName(clientRoot) {
    const cssFolder = path.join(clientRoot, "build/static/css");
    const files = fs.readdirSync(cssFolder);
    if (!files || !files.length) {
        throw new Error("Cannot locate web-client CSS build directory.");
    }
    const idx = files.findIndex(file => path.extname(file) === ".css");
    if (idx === -1) {
        throw new Error("Cannot locate web-client prebuilt CSS file.");
    }
    return files[idx];
}
exports.default = getStaticStyleSheetFileName;
//# sourceMappingURL=getStaticStyleSheetFileName.js.map
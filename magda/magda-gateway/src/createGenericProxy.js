"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const createBaseProxy_1 = require("./createBaseProxy");
function createGenericProxy(target) {
    const webRouter = express.Router();
    const proxy = createBaseProxy_1.default();
    webRouter.get("*", (req, res) => {
        proxy.web(req, res, { target });
    });
    return webRouter;
}
exports.default = createGenericProxy;
//# sourceMappingURL=createGenericProxy.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const _ = require("lodash");
const escapeStringRegexp = require("escape-string-regexp");
const buildJwt_1 = require("@keldaio/typescript-common/dist/session/buildJwt");
const createBaseProxy_1 = require("./createBaseProxy");
function createApiRouter(options) {
    var proxy = createBaseProxy_1.default();
    const authenticator = options.authenticator;
    const jwtSecret = options.jwtSecret;
    const router = express.Router();
    proxy.on("proxyReq", (proxyReq, req, res, options) => {
        if (jwtSecret && req.user) {
            proxyReq.setHeader("X-Magda-Session", buildJwt_1.default(jwtSecret, req.user.id));
        }
    });
    function proxyRoute(baseRoute, target, verbs = ["all"], auth = false, redirectTrailingSlash = false) {
        console.log("PROXY", baseRoute, target);
        const routeRouter = express.Router();
        if (authenticator && auth) {
            authenticator.applyToRoute(routeRouter);
        }
        verbs.forEach((verb) => routeRouter[verb.toLowerCase()]("*", (req, res) => {
            proxy.web(req, res, { target });
        }));
        if (redirectTrailingSlash) {
            // --- has to use RegEx as `req.originalUrl` will match both with & without trailing /
            const re = new RegExp(`^${escapeStringRegexp(baseRoute)}$`);
            router.get(re, function (req, res) {
                res.redirect(`${req.originalUrl}/`);
            });
        }
        router.use(baseRoute, routeRouter);
        return routeRouter;
    }
    _.forEach(options.routes, (value, key) => {
        proxyRoute(`/${key}`, value.to, value.methods, !!value.auth, value.redirectTrailingSlash);
    });
    return router;
}
exports.default = createApiRouter;
//# sourceMappingURL=createApiRouter.js.map

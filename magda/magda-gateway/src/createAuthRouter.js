"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ApiClient_1 = require("@keldaio/typescript-common/dist/authorization-api/ApiClient");
const passport = require("passport");
function createAuthRouter(options) {
    const authRouter = express_1.Router();
    const authApi = new ApiClient_1.default(options.authorizationApi, options.jwtSecret, options.userId);
    if (options.authenticator) {
        options.authenticator.applyToRoute(authRouter);
    }
    authRouter.use(require("body-parser").urlencoded({ extended: true }));
    const providers = [
        {
            id: "facebook",
            enabled: options.facebookClientId ? true : false,
            authRouter: require("./oauth2/facebook").default({
                authorizationApi: authApi,
                passport: passport,
                clientId: options.facebookClientId,
                clientSecret: options.facebookClientSecret,
                externalAuthHome: `${options.externalUrl}/auth`
            })
        },
        {
            id: "google",
            enabled: options.googleClientId ? true : false,
            authRouter: require("./oauth2/google").default({
                authorizationApi: authApi,
                passport: passport,
                clientId: options.googleClientId,
                clientSecret: options.googleClientSecret,
                externalAuthHome: `${options.externalUrl}/auth`
            })
        },
        {
            id: "ckan",
            enabled: options.ckanUrl ? true : false,
            authRouter: require("./oauth2/ckan").default({
                authorizationApi: authApi,
                passport: passport,
                externalAuthHome: `${options.externalUrl}/auth`
            })
        }
    ];
    // Define routes.
    authRouter.get("/", function (req, res) {
        res.render("home", { user: req.user });
    });
    authRouter.get("/login", function (req, res) {
        res.render("login");
    });
    authRouter.get("/admin", function (req, res) {
        res.render("admin");
    });
    providers.filter(provider => provider.enabled).forEach(provider => {
        authRouter.use("/login/" + provider.id, provider.authRouter);
    });
    authRouter.get("/providers", (req, res) => {
        res.json(providers
            .filter(provider => provider.enabled)
            .map(provider => provider.id));
    });
    authRouter.get("/profile", require("connect-ensure-login").ensureLoggedIn(), function (req, res) {
        authApi
            .getUser(req.user.id)
            .then(user => res.render("profile", { user: user.valueOrThrow() }))
            .catch((error) => {
            console.error(error);
            res.status(500).send("Error");
        });
    });
    authRouter.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/auth");
    });
    return authRouter;
}
exports.default = createAuthRouter;
//# sourceMappingURL=createAuthRouter.js.map
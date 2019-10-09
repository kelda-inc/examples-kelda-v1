"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const createOrGetUserToken_1 = require("../createOrGetUserToken");
const redirect_1 = require("./redirect");
function google(options) {
    const authorizationApi = options.authorizationApi;
    const passport = options.passport;
    const clientId = options.clientId;
    const clientSecret = options.clientSecret;
    const externalAuthHome = options.externalAuthHome;
    const loginBaseUrl = `${externalAuthHome}/login`;
    if (!clientId) {
        return undefined;
    }
    passport.use(new passport_google_oauth20_1.Strategy({
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: `${loginBaseUrl}/google/return`
    }, function (accessToken, refreshToken, profile, cb) {
        createOrGetUserToken_1.default(authorizationApi, profile, "google")
            .then(userId => cb(null, userId))
            .catch(error => cb(error));
    }));
    const router = express.Router();
    router.get("/", (req, res, next) => {
        const options = {
            scope: ["profile", "email"],
            state: req.query.redirect || externalAuthHome
        };
        passport.authenticate("google", options)(req, res, next);
    });
    router.get("/return", (req, res, next) => {
        passport.authenticate("google", {
            failWithError: true
        })(req, res, next);
    }, (req, res, next) => {
        redirect_1.redirectOnSuccess(req.query.state, req, res);
    }, (err, req, res, next) => {
        redirect_1.redirectOnError(err, req.query.state, req, res);
    });
    return router;
}
exports.default = google;
//# sourceMappingURL=google.js.map
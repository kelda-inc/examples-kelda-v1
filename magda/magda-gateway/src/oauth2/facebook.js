"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport_facebook_1 = require("passport-facebook");
const express = require("express");
const createOrGetUserToken_1 = require("../createOrGetUserToken");
const redirect_1 = require("./redirect");
function facebook(options) {
    const authorizationApi = options.authorizationApi;
    const passport = options.passport;
    const clientId = options.clientId;
    const clientSecret = options.clientSecret;
    const externalAuthHome = options.externalAuthHome;
    const loginBaseUrl = `${externalAuthHome}/login`;
    if (!clientId) {
        return undefined;
    }
    passport.use(new passport_facebook_1.Strategy({
        clientID: clientId,
        clientSecret: clientSecret,
        profileFields: ["displayName", "picture", "email"],
        callbackURL: undefined
    }, function (accessToken, refreshToken, profile, cb) {
        createOrGetUserToken_1.default(authorizationApi, profile, "facebook")
            .then(userId => cb(null, userId))
            .catch(error => cb(error));
    }));
    const router = express.Router();
    router.get("/", (req, res, next) => {
        // callbackURL property from https://github.com/jaredhanson/passport-facebook/issues/2
        // But it's not in the typescript defintions (as of @types/passport@0.3.4), so we need
        // sneak it in via an `any`.
        const options = {
            scope: ["public_profile", "email"],
            callbackURL: `${loginBaseUrl}/facebook/return?redirect=${encodeURIComponent(req.query.redirect || externalAuthHome)}`
        };
        passport.authenticate("facebook", options)(req, res, next);
    });
    router.get("/return", function (req, res, next) {
        const options = {
            callbackURL: `${loginBaseUrl}/facebook/return?redirect=${encodeURIComponent(req.query.redirect || externalAuthHome)}`,
            failWithError: true
        };
        passport.authenticate("facebook", options)(req, res, next);
    }, (req, res, next) => {
        redirect_1.redirectOnSuccess(req.query.redirect || externalAuthHome, req, res);
    }, (err, req, res, next) => {
        console.error(err);
        redirect_1.redirectOnError(err, req.query.redirect || externalAuthHome, req, res);
    });
    return router;
}
exports.default = facebook;
//# sourceMappingURL=facebook.js.map
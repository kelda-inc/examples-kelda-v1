"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const passport_local_1 = require("passport-local");
const loginToCkan_1 = require("./loginToCkan");
const createOrGetUserToken_1 = require("../createOrGetUserToken");
const redirect_1 = require("./redirect");
function ckan(options) {
    const authorizationApi = options.authorizationApi;
    const passport = options.passport;
    const externalAuthHome = options.externalAuthHome;
    passport.use(new passport_local_1.Strategy(function (username, password, cb) {
        loginToCkan_1.default(username, password).then(result => {
            result.caseOf({
                left: error => cb(error),
                right: profile => {
                    createOrGetUserToken_1.default(authorizationApi, profile, "ckan")
                        .then(userId => cb(null, userId))
                        .catch(error => cb(error));
                }
            });
        });
    }));
    const router = express.Router();
    router.get("/", function (req, res) {
        res.render("form");
    });
    router.post("/", (req, res, next) => {
        passport.authenticate("local", {
            failWithError: true
        })(req, res, next);
    }, (req, res, next) => {
        redirect_1.redirectOnSuccess(req.query.redirect || externalAuthHome, req, res);
    }, (err, req, res, next) => {
        redirect_1.redirectOnError(err, req.query.redirect || externalAuthHome, req, res);
    });
    return router;
}
exports.default = ckan;
//# sourceMappingURL=ckan.js.map
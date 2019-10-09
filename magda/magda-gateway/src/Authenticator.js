"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createPool_1 = require("./createPool");
const passport = require("passport");
const session = require("express-session");
class Authenticator {
    constructor(options) {
        passport.serializeUser(function (user, cb) {
            cb(null, user);
        });
        passport.deserializeUser(function (user, cb) {
            cb(null, user);
        });
        const store = new (require("connect-pg-simple")(session))({
            pool: createPool_1.default(options)
        });
        this.cookieParserMiddleware = require("cookie-parser")();
        this.sessionMiddleware = session({
            store,
            secret: options.sessionSecret,
            cookie: { maxAge: 7 * 60 * 60 * 1000 },
            resave: false,
            saveUninitialized: false,
            rolling: true
        });
        this.passportMiddleware = passport.initialize();
        this.passportSessionMiddleware = passport.session();
    }
    applyToRoute(router) {
        router.use(this.cookieParserMiddleware);
        router.use(this.sessionMiddleware);
        router.use(this.passportMiddleware);
        router.use(this.passportSessionMiddleware);
    }
}
exports.default = Authenticator;
//# sourceMappingURL=Authenticator.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const URI = require("urijs");
function redirectOnSuccess(toURL, req, res) {
    const source = URI(toURL)
        .setSearch("result", "success")
        .removeSearch("errorMessage");
    res.redirect(source.toString());
}
exports.redirectOnSuccess = redirectOnSuccess;
function redirectOnError(err, toURL, req, res) {
    const source = URI(toURL)
        .setSearch("result", "failure")
        .setSearch("errorMessage", err);
    res.redirect(source.toString());
}
exports.redirectOnError = redirectOnError;
//# sourceMappingURL=redirect.js.map
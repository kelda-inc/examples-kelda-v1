"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("isomorphic-fetch");
require("isomorphic-form-data");
const tsmonad_1 = require("tsmonad");
const cheerio = require("cheerio");
const gravatar = require("gravatar");
function loginToCkan(username, password) {
    return fetch("https://data.gov.au/login_generic?came_from=/user/logged_in", {
        method: "POST",
        redirect: "manual",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `login=${username}&password=${password}`
    }).then(res => {
        const cookies = res.headers.get("set-cookie");
        if (!cookies) {
            return Promise.resolve(tsmonad_1.Either.left("unauthorized"));
        }
        const relevantCookie = cookies.split(";")[0];
        return afterLoginSuccess(relevantCookie, username);
    });
}
function afterLoginSuccess(cookies, username) {
    return fetch("https://data.gov.au/user/edit/" + username, {
        headers: {
            cookie: cookies
        }
    }).then(secondRes => {
        if (secondRes.status === 200) {
            return parseUser(secondRes);
        }
        else {
            return Promise.resolve(tsmonad_1.Either.left("unauthorized"));
        }
    });
}
function parseUser(res) {
    return res.text().then(text => {
        const $ = cheerio.load(text);
        const userName = $("#field-username").attr("value");
        const email = $("#field-email").attr("value");
        const displayName = $("#field-fullname").attr("value");
        return Promise.resolve(tsmonad_1.Either.right({
            id: userName,
            provider: "ckan",
            displayName,
            emails: [{ value: email }],
            photos: [{ value: gravatar.url(email) }]
        }));
    });
}
exports.default = loginToCkan;
//# sourceMappingURL=loginToCkan.js.map
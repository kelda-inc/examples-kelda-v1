"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sinon = require("sinon");
const chai_1 = require("chai");
const nock = require("nock");
const supertest = require("supertest");
const xml2js_1 = require("xml2js");
const buildSitemapRouter_1 = require("../buildSitemapRouter");
const typed_promisify_1 = require("typed-promisify");
const RegistryClient_1 = require("@keldaio/typescript-common/dist/registry/RegistryClient");
const noOptionsParseString = (string, callback) => xml2js_1.parseString(string, callback);
const parsePromise = typed_promisify_1.promisify(noOptionsParseString);
describe("sitemap router", () => {
    const baseExternalUrl = "http://example.com";
    const registryUrl = "http://registry.example.com";
    const registry = new RegistryClient_1.default({
        baseUrl: registryUrl,
        maxRetries: 0
    });
    let router;
    let registryScope;
    beforeEach(() => {
        router = buildSitemapRouter_1.default({ baseExternalUrl, registry });
        registryScope = nock(registryUrl);
    });
    afterEach(() => {
        if (console.error.restore) {
            console.error.restore();
        }
    });
    describe("/sitemap.xml", () => {
        it("should reflect page tokens from registry", () => {
            const tokens = [0, 100, 200];
            registryScope
                .get("/records/pagetokens?aspect=dcat-dataset-strings")
                .reply(200, tokens);
            return supertest(router)
                .get("/sitemap.xml")
                .expect(200)
                .expect(checkRequestMetadata)
                .then(res => parsePromise(res.text))
                .then(xmlObj => {
                const urls = xmlObj.sitemapindex.sitemap.map((mapEntry) => mapEntry.loc[0]);
                const expected = tokens.map(token => baseExternalUrl +
                    "/sitemap/dataset/afterToken/" +
                    token +
                    ".xml");
                chai_1.expect(urls).to.eql([baseExternalUrl + "/sitemap/main.xml"].concat(expected));
            });
        });
        it("should handle registry failure as 500", () => {
            silenceConsoleError();
            registryScope
                .get("/records/pagetokens?aspect=dcat-dataset-strings")
                .reply(500);
            return supertest(router)
                .get("/sitemap.xml")
                .expect(500);
        });
    });
    describe("/sitemap/main.xml", () => {
        it("should return the home page", () => {
            return supertest(router)
                .get("/sitemap/main.xml")
                .expect(200)
                .expect(checkRequestMetadata)
                .then(res => parsePromise(res.text))
                .then(xmlObj => {
                chai_1.expect(xmlObj.urlset.url[0].loc[0]).to.equal(baseExternalUrl + "/");
            });
        });
    });
    describe("/sitemap/dataset/afterToken/:afterToken", () => {
        const token = "1234";
        it("should return the datasets pages for the corresponding datasets page with that token", () => {
            const recordIds = ["a", "b", "c"];
            registryScope
                .get(`/records?aspect=dcat-dataset-strings&optionalAspect=&pageToken=${token}&dereference=false`)
                .reply(200, {
                records: recordIds.map(id => ({
                    id
                }))
            });
            return supertest(router)
                .get(`/sitemap/dataset/afterToken/${token}.xml`)
                .expect(200)
                .expect(checkRequestMetadata)
                .then(res => parsePromise(res.text))
                .then(xmlObj => {
                const urls = xmlObj.urlset.url.map((url) => url.loc[0]);
                const expectedUrls = recordIds.map(id => `${baseExternalUrl}/dataset/${encodeURIComponent(id)}`);
                chai_1.expect(urls).to.eql(expectedUrls);
            });
        });
        it("should handle registry failure as 500", () => {
            silenceConsoleError();
            registryScope
                .get("/records?aspect=dcat-dataset-strings&optionalAspect=&pageToken=${token}&dereference=false")
                .reply(500);
            return supertest(router)
                .get(`/sitemap/dataset/afterToken/${token}.xml`)
                .expect(500);
        });
    });
    function silenceConsoleError() {
        sinon.stub(console, "error");
    }
    /**
     * Make sure that encoding is UTF-8 and content-type is application/xml.
     */
    function checkRequestMetadata(res) {
        chai_1.expect(res.charset).to.equal("utf-8");
        chai_1.expect(res.header["content-type"]).to.contain("application/xml");
    }
});
//# sourceMappingURL=sitemap.spec.js.map
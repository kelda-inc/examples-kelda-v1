"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const URI = require("urijs");
const _ = require("lodash");
const request = require("request");
const lodash_1 = require("lodash");
exports.genericUrlRedirectConfigs = [
    {
        path: "/api/3",
        requireExtraSeqment: true
    },
    "/dataset/edit",
    "/dataset/new",
    {
        path: "/fanstatic",
        requireExtraSeqment: true
    },
    "/geoserver",
    "/group",
    "/showcase",
    {
        path: "/storage",
        requireExtraSeqment: true
    },
    {
        path: "/uploads",
        requireExtraSeqment: true
    },
    {
        path: "/vendor/leaflet",
        requireExtraSeqment: true
    },
    "/user",
    "/stats",
    "/datarequest"
];
function covertGenericUrlRedirectConfigToFullArgList(config) {
    let fullConfig;
    if (typeof config === "string") {
        fullConfig = { path: config };
    }
    else {
        fullConfig = Object.assign({}, config);
    }
    const { path, requireExtraSeqment, statusCode, method } = fullConfig;
    const args = [path];
    args.push(requireExtraSeqment ? requireExtraSeqment : false);
    args.push(statusCode ? statusCode : 307);
    args.push(method ? method : "all");
    return args;
}
exports.covertGenericUrlRedirectConfigToFullArgList = covertGenericUrlRedirectConfigToFullArgList;
function buildCkanRedirectionRouter({ ckanRedirectionDomain, ckanRedirectionPath, registryApiBaseUrlInternal }) {
    const router = express.Router();
    /**
     * Redirect a path to ckan system
     *
     * @param path
     * @param requireExtraSeqment
     * Assume path = "/a/b/c":
     * If requireExtraSeqment == false, redirect anything like /a/b/c* to ckan (with domain only change).
     * Here, * stands for zero or more chars string that starts with a single `/` or `?`
     * If requireExtraSeqment == true, redirect anything like /a/b/c/* to ckan (with domain only change).
     * Here, * stands for one or more any chars string
     * @param statusCode
     * @param method `all` stands for all method. `get` stands for http GET only
     */
    function redirectToCkanGeneric(path, requireExtraSeqment = false, statusCode = 307, method = "all") {
        let genericRegExOrStringPattern;
        if (!requireExtraSeqment) {
            genericRegExOrStringPattern = new RegExp(`^${lodash_1.escapeRegExp(path)}(|\\?.*|\\/.*)$`);
        }
        else {
            genericRegExOrStringPattern = `${path}/*`;
        }
        const rounterRef = router;
        const routerMethod = rounterRef[method];
        routerMethod.call(router, genericRegExOrStringPattern, function (req, res) {
            res.redirect(statusCode, URI(req.originalUrl)
                .domain(ckanRedirectionDomain)
                .protocol("https")
                .directory(URI.joinPaths(ckanRedirectionPath, URI(req.originalUrl).directory()).toString())
                .toString());
        });
    }
    router.get("/about", function (req, res) {
        res.redirect(303, "/page/about");
    });
    exports.genericUrlRedirectConfigs.forEach(config => {
        const args = covertGenericUrlRedirectConfigToFullArgList(config);
        redirectToCkanGeneric.apply(null, args);
    });
    /**
     * match /organization & /organization?q=xxx&sort
     * this needs to stay on top of the router for:
     * /organization/*
     * /organization/datarequest/*
     * /organization/about/*
     */
    router.get(/^\/organization(|\?.*)$/, function (req, res) {
        res.redirect(303, URI(req.originalUrl)
            .segment(0, "organisations")
            .removeSearch(["page", "sort"])
            .toString());
    });
    class GenericError extends Error {
        constructor(message = "Unknown Error", errorData = null) {
            super(message);
            this.errorData = null;
            this.errorData = errorData;
        }
    }
    function queryRegistryRecordApi(aspectQuery, aspect, limit = 1) {
        const queryParameters = {
            limit
        };
        if (aspectQuery && aspectQuery.length) {
            queryParameters["aspectQuery"] = aspectQuery;
        }
        if (aspect && aspect.length) {
            queryParameters["aspect"] = aspect;
        }
        const requestOptions = {
            uri: `${registryApiBaseUrlInternal}/records`,
            method: "GET",
            qs: queryParameters,
            qsStringifyOptions: {
                arrayFormat: "repeat"
            },
            json: false,
            encoding: "utf-8"
        };
        return new Promise((resolve, reject) => {
            try {
                request(requestOptions, (error, response, body) => {
                    try {
                        if (error) {
                            if (_.isError(error)) {
                                reject(error);
                            }
                            else {
                                reject(new GenericError("Failed to send request to Registry API.", error));
                            }
                        }
                        else {
                            if (response.statusCode >= 200 &&
                                response.statusCode <= 299) {
                                try {
                                    resolve(JSON.parse(body));
                                }
                                catch (e) {
                                    reject(new GenericError("Failed to parse response.", response));
                                }
                            }
                            else {
                                reject(new GenericError("Registry API failed to process response.", response));
                            }
                        }
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    function queryCkanAspect(ckanIdOrName, aspectName, retrieveAspectContent = true, retrieveAspects = [], limit = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `${aspectName}.${uuidRegEx.test(ckanIdOrName) ? "id" : "name"}:${ckanIdOrName}`;
            let aspectList = [];
            if (retrieveAspects && retrieveAspects.length) {
                aspectList = retrieveAspects;
            }
            else {
                //--- this param only take effect when `retrieveAspects` is missing
                if (retrieveAspectContent) {
                    aspectList.push(aspectName);
                }
            }
            aspectList = _.uniq(aspectList);
            const resData = yield queryRegistryRecordApi([query], retrieveAspects, limit);
            if (!resData || !resData.records || !resData.records.length)
                return null;
            return resData.records;
        });
    }
    const uuidRegEx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function getCkanRecordMagdaId(ckanIdOrName, aspectName) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield queryCkanAspect(ckanIdOrName, aspectName, false);
            if (!records || !records.length || !records[0]["id"]) {
                return null;
            }
            else {
                return records[0]["id"];
            }
        });
    }
    function getCkanDatasetMagdaId(ckanIdOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getCkanRecordMagdaId(ckanIdOrName, "ckan-dataset");
        });
    }
    /**
     * Currently, there is no API can retrieve dataset id by distribution ID directly.
     * We can, however, get ckan `package_id` (this is the ckan dataset Id) from `ckan-resource` aspect for a distribution.
     * And then use `package_id` to query registry API for magda dataset id again.
     */
    function getCkanDatasetMagdaIdByCkanDistributionId(ckanIdOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield queryCkanAspect(ckanIdOrName, "ckan-resource");
            if (!records ||
                !records.length ||
                !records[0]["aspects"] ||
                !records[0]["aspects"]["ckan-resource"] ||
                !records[0]["aspects"]["ckan-resource"]["package_id"]) {
                return null;
            }
            else {
                const ckanDatsetID = records[0]["aspects"]["ckan-resource"]["package_id"];
                return yield getCkanDatasetMagdaId(ckanDatsetID);
            }
        });
    }
    /**
     * Unfortunately, aspect `organization-details` has no `id` field.
     * That means we can't query it as the ckan url may contain ckan-organization id.
     * Luckily, aspect `ckan-dataset`.`organization` has that id.
     * We will query against `ckan-dataset.organization` and then pull `dataset-publisher` aspect of that dataset.
     * Thanks to registry API's flexible `records` aspectQuery interface. We actually can shorten the whole story into one query:
     * /records?aspectQuery=ckan-dataset.organization.id:5a9f3a8e-2673-4c6e-be5b-e8f7287993c5&aspect=dataset-publisher&limt=1
     */
    function getCkanOrganisationMagdaId(ckanIdOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield queryCkanAspect(ckanIdOrName, "ckan-dataset.organization", true, ["dataset-publisher"]);
            if (!records ||
                !records.length ||
                !records[0]["aspects"] ||
                !records[0]["aspects"]["dataset-publisher"] ||
                !records[0]["aspects"]["dataset-publisher"]["publisher"]) {
                return null;
            }
            else {
                return records[0]["aspects"]["dataset-publisher"]["publisher"];
            }
        });
    }
    /**
     * In order to show org dataset page.
     * We need org full name to set the filter.
     */
    function getCkanOrganisationFullNameMagdaId(ckanIdOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield queryCkanAspect(ckanIdOrName, "ckan-dataset.organization", true, ["ckan-dataset"]);
            if (!records ||
                !records.length ||
                !records[0]["aspects"] ||
                !records[0]["aspects"]["ckan-dataset"] ||
                !records[0]["aspects"]["ckan-dataset"]["organization"] ||
                !records[0]["aspects"]["ckan-dataset"]["organization"]["title"]) {
                return null;
            }
            else {
                return records[0]["aspects"]["ckan-dataset"]["organization"]["title"];
            }
        });
    }
    /**
     * This route must be placed before the router for /dataset/* below
     * as we now want to capture anything like /dataset/xxxx/resource/xxxx/download/xxx.xxx
     */
    router.get(/^\/dataset\/(?!ds-)[^\/]+\/resource\/[^\/]{1}.*\/download\/.*$/, function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.redirect(301, URI(req.originalUrl)
                    .domain(ckanRedirectionDomain)
                    .protocol("https")
                    .directory(URI.joinPaths(ckanRedirectionPath, URI(req.originalUrl).directory()).toString())
                    .toString());
            }
            catch (e) {
                console.log(e);
                showError(res, 500);
            }
        });
    });
    /**
     * This route must be placed before the router for /dataset/* below
     * as we now want to capture anything like /dataset/xxxx/view/xxxx
     */
    router.get(/^\/dataset\/(?!ds-)[^\/]+\/resource\/[^\/]{1}.*$/, function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const originUri = new URI(req.originalUrl);
                const dsIdOrName = originUri.segmentCoded(1).trim();
                let datasetMagdaId = yield getCkanDatasetMagdaId(dsIdOrName);
                if (!datasetMagdaId) {
                    const disIdOrName = originUri.segmentCoded(3).trim();
                    datasetMagdaId = yield getCkanDatasetMagdaIdByCkanDistributionId(disIdOrName);
                    if (!datasetMagdaId) {
                        showError(res, {
                            errorCode: 404,
                            recordType: "ckan-resource",
                            recordId: disIdOrName
                        });
                        return;
                    }
                }
                res.redirect(303, `/dataset/${datasetMagdaId}/details`);
            }
            catch (e) {
                console.log(e);
                showError(res, 500);
            }
        });
    });
    /**
     * The second segment of the url could be actions related to a dataset.e.g.:
     *  /dataset/groups/xxx-xx-xxx-xx
     * We need to handle this differently: use segment 2 as ckan ID instead of 1
     */
    const remappedDatasetSubActions = ["groups", "activity", "showcases"];
    router.get(/^\/dataset\/(?!ds-)[^\/]{1}.*$/, function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const originUri = new URI(req.originalUrl);
                const segment1 = originUri.segmentCoded(1).trim();
                let dsIdOrName;
                if (remappedDatasetSubActions.indexOf(segment1) !== -1) {
                    dsIdOrName = originUri.segmentCoded(2).trim();
                }
                else {
                    dsIdOrName = segment1;
                }
                const magdaId = yield getCkanDatasetMagdaId(dsIdOrName);
                if (!magdaId) {
                    showError(res, {
                        errorCode: 404,
                        recordType: "ckan-dataset",
                        recordId: dsIdOrName
                    });
                }
                else {
                    res.redirect(303, `/dataset/${magdaId}/details`);
                }
            }
            catch (e) {
                console.log(e);
                showError(res, 500);
            }
        });
    });
    const orgSubActions = ["about", "datarequest", "activity"];
    router.get(/^\/organization\/[^/]{1}.*$/, function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const originUri = new URI(req.originalUrl);
                const segment1 = originUri.segmentCoded(1).trim();
                let ckanIdOrName;
                if (orgSubActions.indexOf(segment1) !== -1) {
                    ckanIdOrName = originUri.segmentCoded(2).trim();
                }
                else {
                    ckanIdOrName = segment1;
                }
                if (segment1 === "datarequest") {
                    yield redirectToOrgDatasetPage(ckanIdOrName, res);
                }
                else {
                    yield redirectToOrgPage(ckanIdOrName, res);
                }
            }
            catch (e) {
                console.log(e);
                showError(res, 500);
            }
        });
    });
    function redirectToOrgDatasetPage(ckanIdOrName, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ckanIdOrName)
                throw new Error(`Invalid ckanIdOrName ${ckanIdOrName}`);
            const orgFullName = yield getCkanOrganisationFullNameMagdaId(ckanIdOrName);
            if (!orgFullName || !orgFullName.trim()) {
                showError(res, {
                    errorCode: 404,
                    recordType: "ckan-organization-details",
                    recordId: ckanIdOrName
                });
            }
            else {
                let uri = new URI("/search");
                //--- make sure %20 is used instead of +
                uri = uri.escapeQuerySpace(false).search({
                    organisation: orgFullName
                });
                res.redirect(303, uri.toString());
            }
        });
    }
    function redirectToOrgPage(ckanIdOrName, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ckanIdOrName)
                throw new Error(`Invalid ckanIdOrName ${ckanIdOrName}`);
            const magdaId = yield getCkanOrganisationMagdaId(ckanIdOrName);
            if (!magdaId) {
                showError(res, {
                    errorCode: 404,
                    recordType: "ckan-organization-details",
                    recordId: ckanIdOrName
                });
            }
            else {
                res.redirect(303, `/organisations/${magdaId}`);
            }
        });
    }
    function showError(res, errorDataOrErrorCode) {
        let redirectUri = new URI("/error");
        let errorData;
        if (typeof errorDataOrErrorCode === "number") {
            errorData = { errorCode: errorDataOrErrorCode };
        }
        else if (typeof errorDataOrErrorCode === "object") {
            errorData = errorDataOrErrorCode;
        }
        if (errorData && Object.keys(errorData).length) {
            redirectUri = redirectUri.escapeQuerySpace(false).search(errorData);
        }
        res.redirect(303, redirectUri.toString());
    }
    return router;
}
exports.default = buildCkanRedirectionRouter;
//# sourceMappingURL=createCkanRedirectionRouter.js.map
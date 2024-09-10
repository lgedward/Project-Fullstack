"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = void 0;
const runtime_1 = require("@tsoa/runtime");
const memberController_1 = require("./../src/member/memberController");
const authController_1 = require("./../src/auth/authController");
const expressAuth_1 = require("./../src/auth/expressAuth");
const expressAuthenticationRecasted = expressAuth_1.expressAuthentication;
const models = {
    "Member": {
        "dataType": "refObject",
        "properties": {
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    "Authenticated": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string", "required": true },
            "accessToken": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    "Credentials": {
        "dataType": "refObject",
        "properties": {
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
function RegisterRoutes(app) {
    app.post('/member', authenticateMiddleware([{ "jwt": ["admin"] }]), ...((0, runtime_1.fetchMiddlewares)(memberController_1.MemberController)), ...((0, runtime_1.fetchMiddlewares)(memberController_1.MemberController.prototype.createMember)), function MemberController_createMember(request, response, next) {
        const args = {
            member: { "in": "body", "name": "member", "required": true, "ref": "Member" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args, request, response });
            const controller = new memberController_1.MemberController();
            templateService.apiHandler({
                methodName: 'createMember',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    app.get('/member', authenticateMiddleware([{ "jwt": ["member"] }]), ...((0, runtime_1.fetchMiddlewares)(memberController_1.MemberController)), ...((0, runtime_1.fetchMiddlewares)(memberController_1.MemberController.prototype.getAllMembers)), function MemberController_getAllMembers(request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args, request, response });
            const controller = new memberController_1.MemberController();
            templateService.apiHandler({
                methodName: 'getAllMembers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    app.post('/login', ...((0, runtime_1.fetchMiddlewares)(authController_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(authController_1.AuthController.prototype.login)), function AuthController_login(request, response, next) {
        const args = {
            credentials: { "in": "body", "name": "credentials", "required": true, "ref": "Credentials" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args, request, response });
            const controller = new authController_1.AuthController();
            templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    function authenticateMiddleware(security = []) {
        return async function runAuthenticationMiddleware(request, response, next) {
            const failedAttempts = [];
            const pushAndRethrow = (error) => {
                failedAttempts.push(error);
                throw error;
            };
            const secMethodOrPromises = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises = [];
                    for (const name in secMethod) {
                        secMethodAndPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                }
                else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                }
            }
            try {
                request['user'] = await Promise.any(secMethodOrPromises);
                if (response.writableEnded) {
                    return;
                }
                next();
            }
            catch (err) {
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }
        };
    }
}
exports.RegisterRoutes = RegisterRoutes;

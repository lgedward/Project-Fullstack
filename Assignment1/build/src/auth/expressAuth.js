"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = void 0;
const authService_1 = require("./authService");
function expressAuthentication(request, securityName, scopes) {
    return new authService_1.AuthService().check(request.headers.authorization, scopes);
}
exports.expressAuthentication = expressAuthentication;

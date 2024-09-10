"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const db_1 = require("../db");
class AuthService {
    async login(credentials) {
        const select = `SELECT data` +
            ` FROM member` +
            ` WHERE data->>'email' = $1` +
            ` AND data->>'pwhash' = crypt($2, 'cs')`;
        const query = {
            text: select,
            values: [credentials.email, credentials.password],
        };
        const { rows } = await db_1.pool.query(query);
        if (rows.length == 1) {
            const user = rows[0].data;
            const accessToken = jwt.sign({ email: user.email, name: user.name, roles: user.roles }, `${process.env.MASTER_SECRET}`, {
                expiresIn: '30m',
                algorithm: 'HS256'
            });
            console.log('Logging in user:', user.name);
            console.log('Access Token:', accessToken);
            return { name: user.name, accessToken: accessToken };
        }
        return undefined;
    }
    async check(authHeader, scopes) {
        return new Promise((resolve, reject) => {
            if (!authHeader) {
                reject(new Error("Unauthorised"));
            }
            else {
                const token = authHeader.split(' ')[1];
                jwt.verify(token, `${process.env.MASTER_SECRET}`, (err, decoded) => {
                    const user = decoded;
                    if (err) {
                        reject(err);
                    }
                    else if (scopes) {
                        for (const scope of scopes) {
                            if (!user.roles || !user.roles.includes(scope)) {
                                reject(new Error("Unauthorised"));
                            }
                        }
                    }
                    resolve({ email: user.email, name: user.name });
                });
            }
        });
    }
}
exports.AuthService = AuthService;

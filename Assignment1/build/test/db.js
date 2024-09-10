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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shutdown = exports.reset = void 0;
const pg_1 = require("pg");
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
process.env.POSTGRES_DB = 'test';
const pool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});
const run = async (file) => {
    const content = fs.readFileSync(file, 'utf8');
    const statements = content.split(/\r?\n/);
    for (const statement of statements) {
        if (statement) {
            await pool.query(statement);
        }
    }
};
const reset = async () => {
    await run('sql/schema.sql');
    await run('sql/test.sql');
};
exports.reset = reset;
const shutdown = () => {
    pool.end(() => {
    });
};
exports.shutdown = shutdown;

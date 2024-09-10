"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberService = void 0;
const db_1 = require("../db");
class MemberService {
    async create(member) {
        const { email, password, name } = member;
        const insertQuery = `
        INSERT INTO member (data)
        VALUES (jsonb_build_object('email', $1, 'name', $2, 'pwhash', crypt($3, 'cs')))
        RETURNING id, data->>'name' as name
      `;
        const { rows } = await db_1.pool.query(insertQuery, [email, name, password]);
        if (rows.length === 0) {
            throw new Error('Failed to create member');
        }
        return rows[0];
    }
    async getAllMembers() {
        const selectQuery = `SELECT id, data->>'name' as name FROM member`;
        const { rows } = await db_1.pool.query(selectQuery);
        return rows.map(row => ({ id: row.id, name: row.name }));
    }
}
exports.MemberService = MemberService;

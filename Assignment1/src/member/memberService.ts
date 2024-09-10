import { pool } from '../db';
import { Member } from './index';

export class MemberService {
    public async get(member: Member): Promise< Member | undefined> {
        let select = `SELECT id, data FROM member WHERE data->>'email' = $1`;
        let query = {
            text: select,
            values: [member.email],
        };
        const { rows } = await pool.query(query);
        return rows.length == 1 ? rows[0] : undefined;
    }
      
    public async create(member: Member): Promise<{id: string, name: string}> {
        console.log("In the create")
        console.log(member)      

        const select = `INSERT INTO member(data) VALUES (jsonb_build_object('email', $1::text, 'name', $2::text, 'pwhash', crypt($3::text, 'cs'))) RETURNING id, data->>'name' as name`;
        const query = {
            text: select,
            values: [member.email, member.name, member.password],
        };
        const { rows } = await pool.query(query);
        console.log("Sent the query")
        if (rows.length === 0) {
            throw new Error('Failed to create member');
        }
        return rows[0];
    }

    public async getAllMembers(): Promise<{id: string, name: string}[]> {
        const selectQuery = `SELECT id, data->>'name' as name FROM member`;
        const { rows } = await pool.query(selectQuery);
        return rows.map(row => ({ id: row.id, name: row.name }));
    }
}
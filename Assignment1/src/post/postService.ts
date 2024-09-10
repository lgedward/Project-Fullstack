import { pool } from '../db';

export class PostService {
    async createPost(userId: string, postData: { content: string, image: string }) {
        const insertQuery = `
            INSERT INTO post (user_id, content, posted_at) 
            VALUES ($1, $2, now())
            RETURNING id, user_id, content, posted_at;
        `;
        const contentJson = JSON.stringify({ text: postData.content, image: postData.image });
        try {
            const { rows } = await pool.query(insertQuery, [userId, contentJson]);
            const post = rows[0];
            return {
                id: post.id,
                member: post.user_id,
                posted: post.posted_at,
                content: postData.content,
                image: postData.image
            };
        } catch (error) {
            console.error('Failed to create post:', error);
            throw new Error('Database operation failed');
        }
    }

    async getPosts(userId: string, page: number) {
        const pageSize = 20; // Number of posts per page
        const offset = (page - 1) * pageSize;
        const fetchQuery = `
            SELECT id, user_id, content, posted_at 
            FROM post 
            WHERE user_id = $1
            ORDER BY posted_at DESC 
            LIMIT $2 OFFSET $3;
        `;
        try {
            const { rows } = await pool.query(fetchQuery, [userId, pageSize, offset]);
            return rows.map(row => ({
                id: row.id,
                member: row.user_id,
                posted: row.posted_at,
                content: JSON.parse(row.content).text,
                image: JSON.parse(row.content).image
            }));
        } catch (error) {
            console.error('Failed to retrieve posts:', error);
            throw new Error('Database operation failed');
        }
    }
}
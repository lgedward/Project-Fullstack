import { pool } from '../db';

interface CustomError extends Error {
  statusCode?: number;
  message: string;
}

function isCustomError(error: unknown): error is CustomError {
  return typeof error === 'object' && error !== null && 'message' in error && 'statusCode' in error;
}

export class FriendService {
  async getFriends(userId: string) {
    const friendsQuery = `
      SELECT 
        m.id AS friend_id, 
        m.data ->> 'name' AS friend_name, 
        f.status AS relationship_status
      FROM 
        friend f 
        JOIN member m ON m.id = CASE 
          WHEN f.sender_id = $1 THEN f.receiver_id 
          ELSE f.sender_id 
        END
      WHERE 
        f.sender_id = $1 OR f.receiver_id = $1
        AND f.status = 'accepted';
    `;
    try {
      const { rows } = await pool.query(friendsQuery, [userId]);
      return rows.map(row => ({
          id: row.friend_id,
          name: row.friend_name,
          accepted: row.relationship_status === 'accepted'
      }));
    } catch (error) {
      if (isCustomError(error)) {
        console.error(`Error ${error.statusCode}: ${error.message}`);
      } else {
        console.error('An unexpected error occurred', error);
      }
      throw new Error('Database query failed');
    }
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    const checkExisting = `SELECT * FROM friend WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`;
    try {
        const { rows } = await pool.query(checkExisting, [senderId, receiverId]);
        if (rows.length > 0) {
            throw { statusCode: 409, message: "Friend request already exists or they are already friends." };
        }

        const insertQuery = `
          INSERT INTO friend (sender_id, receiver_id) VALUES ($1, $2) RETURNING receiver_id;
        `;
        const insertResult = await pool.query(insertQuery, [senderId, receiverId]);
        const receivedId = insertResult.rows[0].receiver_id;

        const nameQuery = `
          SELECT data->>'name' AS name FROM member WHERE id = $1;
        `;
        const nameResult = await pool.query(nameQuery, [receivedId]);
        const name = nameResult.rows[0].name;

        return {
            id: receivedId,
            name: name,
            accepted: false
        };
    } catch (error) {
        if (isCustomError(error)) {
            console.error(`Error ${error.statusCode}: ${error.message}`);
        } else {
            console.error('Failed to send friend request:', error);
        }
        throw new Error('Failed to send friend request');
    }
  }

  // Method to delete a friend
  async deleteFriend(userId: string, friendId: string) {
    const deleteQuery = `
      DELETE FROM friend WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) RETURNING receiver_id;
    `;
    try {
      const { rows } = await pool.query(deleteQuery, [userId, friendId]);
      if (rows.length === 0) {
        throw { statusCode: 404, message: "Friendship not found." };
      }

      const receivedId = rows[0].receiver_id;

      const nameQuery = `
        SELECT data->>'name' AS name FROM member WHERE id = $1;
      `;
      const nameResult = await pool.query(nameQuery, [receivedId]);
      const name = nameResult.rows[0].name;

      return {
          id: friendId,
          name: name,
          accepted: false
      };
    } catch (error) {
      if (isCustomError(error)) {
        console.error(`Error ${error.statusCode}: ${error.message}`);
      } else {
        console.error('Failed to delete friend:', error);
      }
      throw new Error('Failed to delete friend');
    }
  }
}

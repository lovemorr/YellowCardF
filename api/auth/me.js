import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';
import { handleCors } from '../_cors.js';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const cookies = req.headers.cookie || '';
  const token = cookies.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const result = await sql`SELECT id, username FROM admin_users WHERE id = ${payload.userId}`;
    
    if (result.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({ user: result[0] });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

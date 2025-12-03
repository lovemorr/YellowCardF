import { neon } from '@neondatabase/serverless';
import { handleCors } from '../_cors.js';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { yellow_card_number } = req.query;

  if (!yellow_card_number) {
    return res.status(400).json({ error: 'yellow_card_number is required' });
  }

  try {
    const result = await sql`
      SELECT 1 FROM yellow_card_policies WHERE yellow_card_number = ${yellow_card_number} LIMIT 1
    `;

    return res.status(200).json({ exists: result.length > 0 });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

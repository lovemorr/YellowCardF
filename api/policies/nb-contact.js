import { neon } from '@neondatabase/serverless';
import { handleCors } from '../_cors.js';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { prefix } = req.query;
    
    if (!prefix || prefix.length < 2) {
      return res.status(400).json({ error: 'Country prefix required (min 2 characters)' });
    }

    // Find the most recent policy with this prefix that has an issuing_nb_contact
    const result = await sql`
      SELECT issuing_nb_contact 
      FROM yellow_card_policies 
      WHERE yellow_card_number LIKE ${prefix + '%'} 
        AND issuing_nb_contact IS NOT NULL 
        AND issuing_nb_contact != ''
      ORDER BY id DESC 
      LIMIT 1
    `;

    if (result.length > 0) {
      return res.status(200).json({ issuing_nb_contact: result[0].issuing_nb_contact });
    }

    return res.status(200).json({ issuing_nb_contact: null });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

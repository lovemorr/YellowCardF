import { neon } from '@neondatabase/serverless';
import { handleCors } from '../_cors.js';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  try {
    if (req.method === 'GET') {
      const policies = await sql`SELECT * FROM yellow_card_policies ORDER BY id DESC`;
      return res.status(200).json(policies);
    }

    if (req.method === 'POST') {
      const {
        yellow_card_number, pic_name, policy_number, issued_on, issued_timestamp,
        valid_from, valid_upto, customer_name, vehicle_make, vehicle_reg_number,
        countries_covered, vehicle_engine_number, vehicle_chassis_number,
        vehicle_color, no_of_seats, issuing_nb_contact, secretariat_contact
      } = req.body;

      const result = await sql`
        INSERT INTO yellow_card_policies (
          yellow_card_number, pic_name, policy_number, issued_on, issued_timestamp,
          valid_from, valid_upto, customer_name, vehicle_make, vehicle_reg_number,
          countries_covered, vehicle_engine_number, vehicle_chassis_number,
          vehicle_color, no_of_seats, issuing_nb_contact, secretariat_contact
        ) VALUES (
          ${yellow_card_number}, ${pic_name}, ${policy_number}, ${issued_on}, ${issued_timestamp},
          ${valid_from}, ${valid_upto}, ${customer_name}, ${vehicle_make}, ${vehicle_reg_number},
          ${countries_covered}, ${vehicle_engine_number}, ${vehicle_chassis_number},
          ${vehicle_color}, ${no_of_seats}, ${issuing_nb_contact}, ${secretariat_contact}
        ) RETURNING *
      `;
      return res.status(201).json(result[0]);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

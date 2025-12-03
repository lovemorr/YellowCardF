import { neon } from '@neondatabase/serverless';
import { handleCors } from '../_cors.js';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM yellow_card_policies WHERE id = ${id}`;
      if (result.length === 0) {
        return res.status(404).json({ error: 'Policy not found' });
      }
      return res.status(200).json(result[0]);
    }

    if (req.method === 'PUT') {
      const {
        yellow_card_number, pic_name, policy_number, issued_on, issued_timestamp,
        valid_from, valid_upto, customer_name, vehicle_make, vehicle_reg_number,
        countries_covered, vehicle_engine_number, vehicle_chassis_number,
        vehicle_color, no_of_seats, issuing_nb_contact, secretariat_contact
      } = req.body;

      const result = await sql`
        UPDATE yellow_card_policies SET
          yellow_card_number = ${yellow_card_number},
          pic_name = ${pic_name},
          policy_number = ${policy_number},
          issued_on = ${issued_on},
          issued_timestamp = ${issued_timestamp},
          valid_from = ${valid_from},
          valid_upto = ${valid_upto},
          customer_name = ${customer_name},
          vehicle_make = ${vehicle_make},
          vehicle_reg_number = ${vehicle_reg_number},
          countries_covered = ${countries_covered},
          vehicle_engine_number = ${vehicle_engine_number},
          vehicle_chassis_number = ${vehicle_chassis_number},
          vehicle_color = ${vehicle_color},
          no_of_seats = ${no_of_seats},
          issuing_nb_contact = ${issuing_nb_contact},
          secretariat_contact = ${secretariat_contact}
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: 'Policy not found' });
      }
      return res.status(200).json(result[0]);
    }

    if (req.method === 'DELETE') {
      const result = await sql`DELETE FROM yellow_card_policies WHERE id = ${id} RETURNING id`;
      if (result.length === 0) {
        return res.status(404).json({ error: 'Policy not found' });
      }
      return res.status(200).json({ message: 'Policy deleted', id: result[0].id });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

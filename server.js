import express from 'express';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 3000;
const sql = neon(process.env.DATABASE_URL);

// Invalid yellow card numbers
const INVALID_YELLOW_CARD_NUMBERS = [
  "ZW97423785", "ZW6721326", "ZW6273665", "ZW2314370", "ZW9011230",
  "ZW2400757", "ZW0865715", "ZW4534350", "ZW5876557", "ZW8696545",
  "ZW3525671", "ZW7089436", "ZW3785551", "ZW1296530", "ZW7857478",
  "ZW9485064", "ZW6365478", "ZW0077859", "ZW9742132", "ZW0004534",
  "ZW050086", "ZW2153967", "ZW5007421", "ZW5467390", "ZW7699307",
  "ZW1007575", "ZW8575409", "ZW3415774", "ZW8112425", "ZW5286633",
  "ZW3224324", "ZW3003534", "ZW9794536", "ZW242156", "ZW2425780",
  "ZW0007765", "ZW5637778", "ZW768554", "ZW48291573", "ZW10374829",
  "ZW29583714", "ZW50827149", "ZW94732851", "ZW21547893", "ZW93741285",
  "ZW52978431", "ZW17845392", "ZW56294381", "ZW98147325", "ZW74582139",
  "ZW23947851", "ZW18479352", "ZW57824139", "ZW73249581", "ZW24985137",
  "ZW89475321", "ZW31495782", "ZW67582391", "ZW84175238", "ZW96248731",
  "ZW52179438", "ZW38714259", "ZW71459283", "ZW24857319", "ZW53872194",
  "ZW91582734", "ZW87521943", "ZW12784593", "ZW64279531", "ZW35197284",
  "ZW27349581", "ZW81374259", "ZW54821793", "ZW39285741", "ZW45798132",
  "ZW61594732", "ZW72951384", "ZW93817425", "ZW13475829", "ZW84729135",
  "ZW57938241", "ZW67295148", "ZW23951478", "ZW52481739", "ZW67824951",
  "ZW29475813", "ZW81534729", "ZW74385291", "ZW19284753", "ZW53749281",
  "ZW82194735", "ZW96347182", "ZW25987143", "ZW74129835", "ZW34982715",
  "ZW87425193", "ZW62793158", "ZW51837942", "ZW79248531", "ZW23948715",
  "ZW56428713", "ZW82649731", "ZW37184925", "ZW94781532", "ZW58213749",
  "ZW61527398", "ZW73951482", "ZW29847135", "ZW47932851", "ZW31578249",
  "ZW84271936", "ZW19638247", "ZW75829413", "ZW23795148", "ZW64152879",
  "ZW82374195", "ZW52719348", "ZW96827435", "ZW31475829", "ZW49273815",
  "ZW85721934", "ZW17538294", "ZW92647183", "ZW38194275", "ZW67358942",
  "ZW28473591", "ZW81935724", "ZW57218493", "ZW63829175", "ZW42789156",
  "ZW15937284", "ZW68231745", "ZW76182395", "ZW93725184", "ZW34589172"
];

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('.'));

// Auth middleware
async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const result = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
    if (result.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId: user.id, username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 });
    res.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const result = await sql`SELECT id, username FROM admin_users WHERE id = ${req.user.userId}`;
  if (result.length === 0) return res.status(401).json({ error: 'User not found' });
  res.json({ user: result[0] });
});

app.post('/api/auth/register', authMiddleware, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await sql`INSERT INTO admin_users (username, password_hash) VALUES (${username}, ${passwordHash})`;
    res.json({ success: true, message: 'User created' });
  } catch (err) {
    if (err.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Policy routes
app.get('/api/policies', async (req, res) => {
  try {
    const policies = await sql`SELECT * FROM yellow_card_policies ORDER BY id DESC`;
    res.json(policies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/policies', authMiddleware, async (req, res) => {
  const p = req.body;
  try {
    // Auto-Increment Serial Number Logic
    const lastSerialResult = await sql`
      SELECT serial_number FROM yellow_card_policies 
      WHERE serial_number IS NOT NULL 
      ORDER BY id DESC LIMIT 1
    `;

    let nextSerialInt;
    if (lastSerialResult.length === 0 || !lastSerialResult[0].serial_number) {
      // First time: Start from User Provided Seed (Last was 0066173 -> Start at 0066174)
      nextSerialInt = 66174;
      console.log(`First run: No serial found. Starting at: ${nextSerialInt}`);
    } else {
      // Increment
      try {
        const lastVal = parseInt(lastSerialResult[0].serial_number.replace(/\D/g, ''));
        nextSerialInt = lastVal + 1;
      } catch (e) {
        nextSerialInt = 66174; // Fallback
      }
    }

    // Format as 7 digits with leading zeros (e.g. 0066174)
    const nextSerialStr = nextSerialInt.toString().padStart(7, '0');

    const result = await sql`
      INSERT INTO yellow_card_policies (
        yellow_card_number, pic_name, policy_number, issued_on, issued_timestamp,
        valid_from, valid_upto, customer_name, vehicle_make, vehicle_reg_number,
        countries_covered, vehicle_engine_number, vehicle_chassis_number,
        vehicle_color, no_of_seats, issuing_nb_contact, secretariat_contact,
        vehicle_type, vehicle_usage, customer_address, insurer_address,
        financial_premium, financial_tax, financial_total, serial_number
      ) VALUES (
        ${p.yellow_card_number}, ${p.pic_name}, ${p.policy_number}, ${p.issued_on}, ${p.issued_timestamp},
        ${p.valid_from}, ${p.valid_upto}, ${p.customer_name}, ${p.vehicle_make}, ${p.vehicle_reg_number},
        ${p.countries_covered}, ${p.vehicle_engine_number}, ${p.vehicle_chassis_number},
        ${p.vehicle_color}, ${p.no_of_seats}, ${p.issuing_nb_contact}, ${p.secretariat_contact},
        ${p.vehicle_type}, ${p.vehicle_usage}, ${p.customer_address}, ${p.insurer_address},
        ${p.financial_premium}, ${p.financial_tax}, ${p.financial_total}, ${nextSerialStr}
      ) RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/policies/verify', async (req, res) => {
  const { yellow_card_number } = req.query;
  if (!yellow_card_number) return res.status(400).json({ error: 'yellow_card_number required' });

  try {
    const result = await sql`SELECT * FROM yellow_card_policies WHERE yellow_card_number = ${yellow_card_number}`;
    if (result.length === 0) return res.json({ found: false, valid: false });

    const isInvalid = INVALID_YELLOW_CARD_NUMBERS.includes(yellow_card_number);
    res.json({ found: true, valid: !isInvalid, policy: isInvalid ? null : result[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/policies/check', async (req, res) => {
  const { yellow_card_number } = req.query;
  if (!yellow_card_number) return res.status(400).json({ error: 'yellow_card_number required' });

  try {
    const result = await sql`SELECT 1 FROM yellow_card_policies WHERE yellow_card_number = ${yellow_card_number} LIMIT 1`;
    res.json({ exists: result.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/policies/nb-contact', async (req, res) => {
  const { prefix } = req.query;
  if (!prefix || prefix.length < 2) return res.status(400).json({ error: 'Country prefix required (min 2 characters)' });

  try {
    const result = await sql`
      SELECT issuing_nb_contact 
      FROM yellow_card_policies 
      WHERE yellow_card_number LIKE ${prefix + '%'} 
        AND issuing_nb_contact IS NOT NULL 
        AND issuing_nb_contact != ''
      ORDER BY id DESC 
      LIMIT 1
    `;
    res.json({ issuing_nb_contact: result.length > 0 ? result[0].issuing_nb_contact : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/policies/:id', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM yellow_card_policies WHERE id = ${req.params.id}`;
    if (result.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/policies/:id', authMiddleware, async (req, res) => {
  const p = req.body;
  try {
    const result = await sql`
      UPDATE yellow_card_policies SET
        yellow_card_number = ${p.yellow_card_number}, pic_name = ${p.pic_name},
        policy_number = ${p.policy_number}, issued_on = ${p.issued_on},
        issued_timestamp = ${p.issued_timestamp}, valid_from = ${p.valid_from},
        valid_upto = ${p.valid_upto}, customer_name = ${p.customer_name},
        vehicle_make = ${p.vehicle_make}, vehicle_reg_number = ${p.vehicle_reg_number},
        countries_covered = ${p.countries_covered}, vehicle_engine_number = ${p.vehicle_engine_number},
        vehicle_chassis_number = ${p.vehicle_chassis_number}, vehicle_color = ${p.vehicle_color},
        no_of_seats = ${p.no_of_seats}, issuing_nb_contact = ${p.issuing_nb_contact},
        secretariat_contact = ${p.secretariat_contact}, vehicle_type = ${p.vehicle_type},
        vehicle_usage = ${p.vehicle_usage}, customer_address = ${p.customer_address},
        insurer_address = ${p.insurer_address}, financial_premium = ${p.financial_premium},
        financial_tax = ${p.financial_tax}, financial_total = ${p.financial_total}
      WHERE id = ${req.params.id} RETURNING *
    `;
    if (result.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/policies/:id', authMiddleware, async (req, res) => {
  try {
    const result = await sql`DELETE FROM yellow_card_policies WHERE id = ${req.params.id} RETURNING id`;
    if (result.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', id: result[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
  console.log(`Generator: http://localhost:${PORT}/generator.html`);
});

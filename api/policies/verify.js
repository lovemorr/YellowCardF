import { neon } from '@neondatabase/serverless';
import { handleCors } from '../_cors.js';

const sql = neon(process.env.DATABASE_URL);

// Yellow card numbers marked as invalid
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
      SELECT * FROM yellow_card_policies WHERE yellow_card_number = ${yellow_card_number}
    `;

    if (result.length === 0) {
      return res.status(404).json({ 
        found: false, 
        valid: false,
        message: 'Policy not found' 
      });
    }

    const policy = result[0];
    const isInvalid = INVALID_YELLOW_CARD_NUMBERS.includes(yellow_card_number);

    return res.status(200).json({
      found: true,
      valid: !isInvalid,
      policy: isInvalid ? null : policy
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

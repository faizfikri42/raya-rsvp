import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const TABLE = 'open_house_rsvps';

export type RSVP = {
  id: string;
  name: string;
  attending: 'yes' | 'no';
  guest_count: number | null;
  car_plate: string | null;
  message: string | null;
  created_at: string;
};

export async function saveRsvp(data: Omit<RSVP, 'id' | 'created_at'>): Promise<RSVP> {
  const id = Date.now().toString();
  const rows = await sql(
    `INSERT INTO ${TABLE} (id, name, attending, guest_count, car_plate, message)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, data.name, data.attending, data.guest_count ?? null, data.car_plate ?? null, data.message ?? null]
  );
  return rows[0] as RSVP;
}

export async function getAllRsvps(): Promise<RSVP[]> {
  const rows = await sql(`SELECT * FROM ${TABLE} ORDER BY created_at DESC`);
  return rows as RSVP[];
}

export async function deleteRsvp(id: string): Promise<void> {
  await sql(`DELETE FROM ${TABLE} WHERE id = $1`, [id]);
}

export async function updateRsvp(id: string, data: Partial<Omit<RSVP, 'id' | 'created_at'>>): Promise<RSVP> {
  const existing = await sql(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
  if (existing.length === 0) throw new Error('RSVP not found');

  const r = existing[0] as RSVP;
  const name        = data.name        !== undefined ? data.name        : r.name;
  const attending   = data.attending   !== undefined ? data.attending   : r.attending;
  const guest_count = data.guest_count !== undefined ? data.guest_count : r.guest_count;
  const car_plate   = data.car_plate   !== undefined ? data.car_plate   : r.car_plate;
  const message     = data.message     !== undefined ? data.message     : r.message;

  const rows = await sql(
    `UPDATE ${TABLE}
     SET name = $1, attending = $2, guest_count = $3, car_plate = $4, message = $5
     WHERE id = $6
     RETURNING *`,
    [name, attending, guest_count ?? null, car_plate ?? null, message ?? null, id]
  );
  return rows[0] as RSVP;
}

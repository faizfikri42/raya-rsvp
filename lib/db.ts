import { neon } from '@neondatabase/serverless';

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

export async function setupDatabase() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      whatsapp VARCHAR(50) NOT NULL,
      attending VARCHAR(10) NOT NULL,
      guest_count INTEGER NOT NULL DEFAULT 1,
      dietary TEXT,
      message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}

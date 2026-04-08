import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, whatsapp, attending, guest_count, dietary, message } = body;

    if (!name || !whatsapp || !attending) {
      return NextResponse.json({ error: 'Name, WhatsApp, and attendance are required' }, { status: 400 });
    }

    const count = parseInt(guest_count) || 1;
    if (count < 1 || count > 20) {
      return NextResponse.json({ error: 'Guest count must be between 1 and 20' }, { status: 400 });
    }

    const sql = getDb();
    const result = await sql`
      INSERT INTO rsvps (name, whatsapp, attending, guest_count, dietary, message)
      VALUES (${name.trim()}, ${whatsapp.trim()}, ${attending}, ${count}, ${dietary?.trim() || null}, ${message?.trim() || null})
      RETURNING id
    `;

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error('RSVP submit error:', error);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}

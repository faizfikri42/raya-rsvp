import { NextResponse } from 'next/server';
import { setupDatabase } from '@/lib/db';

export async function GET() {
  try {
    await setupDatabase();
    return NextResponse.json({ message: 'Database setup complete' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}

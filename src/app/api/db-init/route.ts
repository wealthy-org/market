import { NextResponse } from 'next/server';
import { initDatabase, isDbConnected } from '@/lib/db';

export async function GET() {
  if (!isDbConnected()) {
    return NextResponse.json({
      success: false,
      message: 'DATABASE_URL is not configured yet. Add your NeonDB connection string to .env.local',
    });
  }

  const result = await initDatabase();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await initDatabase();
  return NextResponse.json(result);
}

import { NextResponse } from 'next/server';
import { dbGetDeals, isDbConnected } from '@/lib/db';

export async function GET() {
  try {
    const deals = await dbGetDeals();
    return NextResponse.json({
      success: true,
      isDbConnected: isDbConnected(),
      count: deals.length,
      deals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

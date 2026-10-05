import { NextResponse } from 'next/server';
import { dbGetDeals, dbInsertDeal, isDbConnected } from '@/lib/db';
import { FundingDeal } from '@/types/market';

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

export async function POST(request: Request) {
  try {
    const deal: FundingDeal = await request.json();
    if (!deal.id || !deal.token?.symbol) {
      return NextResponse.json(
        { success: false, error: 'Invalid deal payload' },
        { status: 400 }
      );
    }
    const result = await dbInsertDeal(deal);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to insert deal' },
      { status: 500 }
    );
  }
}

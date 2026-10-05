import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { FundingDeal, LenderPosition, ActivityItem } from '@/types/market';
import { INITIAL_DEALS, INITIAL_POSITIONS, INITIAL_ACTIVITY } from '@/data/mockDeals';

const databaseUrl = process.env.DATABASE_URL;

let sql: NeonQueryFunction<false, false> | null = null;
if (databaseUrl) {
  try {
    sql = neon(databaseUrl);
  } catch (err) {
    console.warn('Failed to initialize Neon SQL client:', err);
  }
}

export function isDbConnected(): boolean {
  return !!databaseUrl && !!sql;
}

/**
 * Initializes database tables if they do not exist
 */
export async function initDatabase() {
  if (!sql) {
    return { success: false, message: 'DATABASE_URL is not set in environment.' };
  }

  try {
    // 1. Deals table
    await sql`
      CREATE TABLE IF NOT EXISTS deals (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        symbol VARCHAR(32) NOT NULL,
        address VARCHAR(66) NOT NULL,
        avatar VARCHAR(32),
        age VARCHAR(32),
        chain VARCHAR(64),
        pair_token VARCHAR(32),
        creator_address VARCHAR(66),
        status VARCHAR(32) NOT NULL,
        fee_velocity NUMERIC DEFAULT 0,
        fee_velocity_trend NUMERIC DEFAULT 0,
        trend_direction VARCHAR(8) DEFAULT 'up',
        liquidity_usd NUMERIC DEFAULT 0,
        market_cap_usd NUMERIC DEFAULT 0,
        unique_traders INT DEFAULT 0,
        campaign_name VARCHAR(128),
        campaign_target_usd NUMERIC DEFAULT 299,
        funded_usd NUMERIC DEFAULT 0,
        lender_fee_share_pct NUMERIC DEFAULT 70,
        creator_fee_share_pct NUMERIC DEFAULT 30,
        repay_cap_multiplier NUMERIC DEFAULT 1.20,
        projected_payback_hours NUMERIC DEFAULT 8.5,
        creator_fees_accrued_usd NUMERIC DEFAULT 0,
        repaid_to_lenders_usd NUMERIC DEFAULT 0,
        splitter_address VARCHAR(66),
        pool_contract_address VARCHAR(66),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 2. Positions table
    await sql`
      CREATE TABLE IF NOT EXISTS positions (
        id VARCHAR(64) PRIMARY KEY,
        deal_id VARCHAR(64) REFERENCES deals(id) ON DELETE CASCADE,
        user_address VARCHAR(66) NOT NULL,
        token_symbol VARCHAR(32) NOT NULL,
        token_avatar VARCHAR(32),
        campaign_name VARCHAR(128),
        contributed_usd NUMERIC NOT NULL,
        contributed_eth NUMERIC NOT NULL,
        pool_share_pct NUMERIC NOT NULL,
        repaid_usd NUMERIC DEFAULT 0,
        repaid_pct NUMERIC DEFAULT 0,
        claimable_usd NUMERIC DEFAULT 0,
        claimable_eth NUMERIC DEFAULT 0,
        status VARCHAR(32) DEFAULT 'ACTIVE',
        splitter_address VARCHAR(66),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 3. Activities table
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        deal_id VARCHAR(64),
        token_symbol VARCHAR(32),
        token_avatar VARCHAR(32),
        amount_usd NUMERIC,
        amount_eth NUMERIC,
        user_address VARCHAR(66),
        tx_hash VARCHAR(66),
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Seed initial deals if table is empty
    const existing = await sql`SELECT COUNT(*) FROM deals`;
    if (Number(existing[0]?.count || 0) === 0) {
      for (const d of INITIAL_DEALS) {
        await sql`
          INSERT INTO deals (
            id, name, symbol, address, avatar, age, chain, pair_token, creator_address,
            status, fee_velocity, fee_velocity_trend, trend_direction, liquidity_usd,
            market_cap_usd, unique_traders, campaign_name, campaign_target_usd, funded_usd,
            lender_fee_share_pct, creator_fee_share_pct, repay_cap_multiplier,
            projected_payback_hours, creator_fees_accrued_usd, repaid_to_lenders_usd,
            splitter_address, pool_contract_address
          ) VALUES (
            ${d.id}, ${d.token.name}, ${d.token.symbol}, ${d.token.address}, ${d.token.avatar},
            ${d.token.age}, ${d.token.chain}, ${d.token.pairToken}, ${d.token.creatorAddress},
            ${d.status}, ${d.feeVelocity}, ${d.feeVelocityTrend}, ${d.trendDirection},
            ${d.liquidityUsd}, ${d.marketCapUsd}, ${d.uniqueTraders}, ${d.campaignName},
            ${d.campaignTargetUsd}, ${d.fundedUsd}, ${d.lenderFeeSharePct}, ${d.creatorFeeSharePct},
            ${d.repayCapMultiplier}, ${d.projectedPaybackHours}, ${d.creatorFeesAccruedUsd},
            ${d.repaidToLendersUsd}, ${d.splitterAddress}, ${d.poolContractAddress || null}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    return { success: true, message: 'NeonDB schema initialized successfully!' };
  } catch (err: any) {
    console.error('Error during initDatabase:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch all deals from NeonDB (falls back to INITIAL_DEALS)
 */
export async function dbGetDeals(): Promise<FundingDeal[]> {
  if (!sql) return INITIAL_DEALS;
  try {
    const rows = await sql`SELECT * FROM deals ORDER BY created_at DESC`;
    
    const dbDeals: FundingDeal[] = rows.map((r: any) => ({
      id: r.id,
      token: {
        name: r.name,
        symbol: r.symbol,
        address: r.address,
        avatar: r.avatar,
        imageUrl: (r.image_url && !r.image_url.includes('cdn.gondi.xyz/image/'))
          ? r.image_url
          : (INITIAL_DEALS.find((d) => d.id === r.id)?.token.imageUrl || undefined),
        age: r.age,
        chain: r.chain,
        pairToken: r.pair_token,
        creatorAddress: r.creator_address,
      },
      status: r.status,
      feeVelocity: Number(r.fee_velocity),
      feeVelocityTrend: Number(r.fee_velocity_trend),
      trendDirection: r.trend_direction,
      rollingFees: {
        m5: +(Number(r.fee_velocity) * 0.1).toFixed(1),
        m15: +(Number(r.fee_velocity) * 0.3).toFixed(1),
        h1: Number(r.fee_velocity),
        h6: +(Number(r.fee_velocity) * 3.8).toFixed(1),
        h24: +(Number(r.fee_velocity) * 8.7).toFixed(1),
      },
      liquidityUsd: Number(r.liquidity_usd),
      marketCapUsd: Number(r.market_cap_usd),
      uniqueTraders: Number(r.unique_traders),
      campaignName: r.campaign_name,
      campaignTargetUsd: Number(r.campaign_target_usd),
      fundedUsd: Number(r.funded_usd),
      lenderFeeSharePct: Number(r.lender_fee_share_pct),
      creatorFeeSharePct: Number(r.creator_fee_share_pct),
      repayCapMultiplier: Number(r.repay_cap_multiplier),
      projectedPaybackHours: Number(r.projected_payback_hours),
      creatorFeesAccruedUsd: Number(r.creator_fees_accrued_usd),
      repaidToLendersUsd: Number(r.repaid_to_lenders_usd),
      chartData: [
        { time: '30m ago', velocity: +(Number(r.fee_velocity) * 0.7).toFixed(0) },
        { time: '20m ago', velocity: +(Number(r.fee_velocity) * 0.85).toFixed(0) },
        { time: '10m ago', velocity: +(Number(r.fee_velocity) * 0.92).toFixed(0) },
        { time: 'Now', velocity: Number(r.fee_velocity) },
      ],
      eligibility: {
        ageMinutes: 30,
        ageOk: true,
        uniqueTraders: Number(r.unique_traders),
        tradersOk: Number(r.unique_traders) >= 20,
        creatorFeesUsd: Number(r.creator_fees_accrued_usd),
        feesOk: Number(r.creator_fees_accrued_usd) >= 15,
        recipientTransferable: true,
        isEligible: true,
      },
      createdAt: 'Recently',
      splitterAddress: r.splitter_address || '0x3cA85F49e0B8E1B9D79F9983A756Fe2b66236b28',
      poolContractAddress: r.pool_contract_address || undefined,
    }));

    // Check for any missing initial deals and merge them so cards never vanish
    const existingIds = new Set(dbDeals.map((d) => d.id));
    const missingDeals = INITIAL_DEALS.filter((d) => !existingIds.has(d.id));

    if (missingDeals.length > 0) {
      // Seed missing deals to NeonDB
      for (const d of missingDeals) {
        sql`
          INSERT INTO deals (
            id, name, symbol, address, avatar, age, chain, pair_token, creator_address,
            status, fee_velocity, fee_velocity_trend, trend_direction, liquidity_usd,
            market_cap_usd, unique_traders, campaign_name, campaign_target_usd, funded_usd,
            lender_fee_share_pct, creator_fee_share_pct, repay_cap_multiplier,
            projected_payback_hours, creator_fees_accrued_usd, repaid_to_lenders_usd,
            splitter_address, pool_contract_address
          ) VALUES (
            ${d.id}, ${d.token.name}, ${d.token.symbol}, ${d.token.address}, ${d.token.avatar},
            ${d.token.age}, ${d.token.chain}, ${d.token.pairToken}, ${d.token.creatorAddress},
            ${d.status}, ${d.feeVelocity}, ${d.feeVelocityTrend}, ${d.trendDirection},
            ${d.liquidityUsd}, ${d.marketCapUsd}, ${d.uniqueTraders}, ${d.campaignName},
            ${d.campaignTargetUsd}, ${d.fundedUsd}, ${d.lenderFeeSharePct}, ${d.creatorFeeSharePct},
            ${d.repayCapMultiplier}, ${d.projectedPaybackHours}, ${d.creatorFeesAccruedUsd},
            ${d.repaidToLendersUsd}, ${d.splitterAddress}, ${d.poolContractAddress || null}
          ) ON CONFLICT (id) DO NOTHING;
        `.catch((e) => console.warn('Background seed deal error:', e));
      }

      return [...dbDeals, ...missingDeals];
    }

    return dbDeals;
  } catch (err) {
    console.warn('NeonDB query failed, using fallback:', err);
    return INITIAL_DEALS;
  }
}

/**
 * Insert or update a deal in NeonDB
 */
export async function dbInsertDeal(deal: FundingDeal) {
  if (!sql) return { success: false, message: 'No DB connection' };
  try {
    await sql`
      INSERT INTO deals (
        id, name, symbol, address, avatar, age, chain, pair_token, creator_address,
        status, fee_velocity, fee_velocity_trend, trend_direction, liquidity_usd,
        market_cap_usd, unique_traders, campaign_name, campaign_target_usd, funded_usd,
        lender_fee_share_pct, creator_fee_share_pct, repay_cap_multiplier,
        projected_payback_hours, creator_fees_accrued_usd, repaid_to_lenders_usd,
        splitter_address, pool_contract_address
      ) VALUES (
        ${deal.id}, ${deal.token.name}, ${deal.token.symbol}, ${deal.token.address}, ${deal.token.avatar},
        ${deal.token.age}, ${deal.token.chain}, ${deal.token.pairToken}, ${deal.token.creatorAddress},
        ${deal.status}, ${deal.feeVelocity}, ${deal.feeVelocityTrend}, ${deal.trendDirection},
        ${deal.liquidityUsd}, ${deal.marketCapUsd}, ${deal.uniqueTraders}, ${deal.campaignName},
        ${deal.campaignTargetUsd}, ${deal.fundedUsd}, ${deal.lenderFeeSharePct}, ${deal.creatorFeeSharePct},
        ${deal.repayCapMultiplier}, ${deal.projectedPaybackHours}, ${deal.creatorFeesAccruedUsd},
        ${deal.repaidToLendersUsd}, ${deal.splitterAddress}, ${deal.poolContractAddress || null}
      )
      ON CONFLICT (id) DO UPDATE SET
        funded_usd = EXCLUDED.funded_usd,
        status = EXCLUDED.status,
        creator_fees_accrued_usd = EXCLUDED.creator_fees_accrued_usd,
        repaid_to_lenders_usd = EXCLUDED.repaid_to_lenders_usd;
    `;
    return { success: true };
  } catch (err: any) {
    console.error('dbInsertDeal error:', err);
    return { success: false, error: err?.message };
  }
}


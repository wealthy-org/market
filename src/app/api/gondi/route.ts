import { NextResponse } from 'next/server';

/**
 * Route handler to consume Gondi's public GraphQL API (api2.gondi.xyz)
 * Demonstrates live API consumption with zero API key required.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const query = `
      query GetGondiLiveCollections($first: Int!) {
        listCollections(first: $first) {
          edges {
            node {
              id
              name
              slug
              image {
                data
                contentTypeMime
              }
              statistics {
                floorPrice {
                  amount
                  currency {
                    symbol
                    decimals
                  }
                }
                nftsCount
                outstandingLoanCount
                repaymentRate
                numberOfListings
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api2.gondi.xyz/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { first: Math.min(limit, 30) },
      }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Gondi API responded with status ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
      return NextResponse.json(
        { success: false, errors: json.errors },
        { status: 400 }
      );
    }

    const collections = (json.data?.listCollections?.edges || []).map((edge: any) => {
      const node = edge.node;
      const floorEth = node.statistics?.floorPrice?.amount ?? 0;
      const repaymentPct = node.statistics?.repaymentRate
        ? +(node.statistics.repaymentRate * 100).toFixed(1)
        : null;

      return {
        id: node.id,
        name: node.name,
        slug: node.slug,
        imageUrl: node.image?.data || null,
        floorPriceEth: +floorEth.toFixed(4),
        floorPriceUsd: +(floorEth * 2500).toFixed(2),
        currency: node.statistics?.floorPrice?.currency?.symbol || 'ETH',
        nftsCount: Math.round(node.statistics?.nftsCount || 0),
        activeLoansCount: node.statistics?.outstandingLoanCount ?? 0,
        repaymentRatePct: repaymentPct,
        gondiUrl: `https://www.gondi.xyz/collection/${node.slug}`,
        source: 'GONDI_LIVE_GRAPHQL',
      };
    });

    return NextResponse.json({
      success: true,
      count: collections.length,
      collections,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching from Gondi API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Gondi data' },
      { status: 500 }
    );
  }
}

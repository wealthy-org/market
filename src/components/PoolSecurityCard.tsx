'use client';

import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ShieldCheck, Loader2 } from 'lucide-react';
import type { FundingDeal } from '@/types/market';
import { FundingPoolABI } from '@/lib/contracts';
import { usePoolSecurity, useVerifyFeeTransfer } from '@/hooks/useFundingProtocol';

function isAddr(v?: string): v is `0x${string}` {
  return !!v && v.startsWith('0x') && v.length === 42;
}

export const PoolSecurityCard: React.FC<{ deal: FundingDeal }> = ({ deal }) => {
  const { isConnected } = useAccount();
  const pool = isAddr(deal.poolContractAddress) ? deal.poolContractAddress : undefined;

  const escrowQuery = useReadContract({
    address: pool,
    abi: FundingPoolABI,
    functionName: 'escrow',
    query: { enabled: !!pool },
  });
  const escrowRaw = escrowQuery.data as string | undefined;
  const escrow = isAddr(escrowRaw) && escrowRaw !== '0x0000000000000000000000000000000000000000' ? escrowRaw : undefined;

  const { feeTransferVerified, canRelease, executionDeadline, refetch } = usePoolSecurity(pool, escrow);
  const { verify, isPending, isConfirming, isSuccess } = useVerifyFeeTransfer(pool);

  React.useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  // Demo deal without onchain pool — explain the guard without fake green checks
  if (!pool) {
    return (
      <div style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: 'var(--ink)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <ShieldCheck size={15} style={{ flexShrink: 0, color: 'var(--muted)' }} />
        <span>
          <b>Demo deal</b> — no onchain pool yet. On real pools, campaign funds unlock only after{' '}
          <b>fee transfer verified</b> + inside the <b>7-day execution window</b>.
        </span>
      </div>
    );
  }

  const verified = feeTransferVerified === true;
  const blocked = feeTransferVerified === false;
  const deadlineLabel =
    executionDeadline !== null && executionDeadline > 0
      ? new Date(executionDeadline * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      : '—';

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <ShieldCheck size={15} style={{ color: verified ? 'var(--emerald)' : 'var(--muted)', flexShrink: 0 }} />
        <span style={{ fontWeight: 800 }}>Fee transfer</span>
        {feeTransferVerified === null ? (
          <span style={{ color: 'var(--muted)' }}>checking onchain…</span>
        ) : verified ? (
          <span style={{ fontWeight: 800, color: 'var(--emerald)' }}>Verified ✓</span>
        ) : (
          <span style={{ fontWeight: 800, color: '#b8860b' }}>Not verified</span>
        )}
        <span style={{ color: 'var(--line)' }}>·</span>
        <span style={{ color: 'var(--muted)' }}>
          Escrow release: {canRelease === null ? '…' : canRelease ? <b style={{ color: 'var(--emerald)' }}>ready</b> : <b>blocked</b>}
        </span>
        <span style={{ color: 'var(--line)' }}>·</span>
        <span style={{ color: 'var(--muted)' }}>Deadline: <b style={{ color: 'var(--ink)' }}>{deadlineLabel}</b></span>
        {blocked && (
          <button
            type="button"
            disabled={!isConnected || isPending || isConfirming}
            onClick={() => verify().then(() => refetch()).catch(() => {})}
            title={isConnected ? 'Verify Pons fee recipient == splitter' : 'Connect wallet to verify'}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: isConnected ? 'var(--ink)' : 'var(--soft)',
              color: isConnected ? '#fff' : 'var(--muted)',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: isConnected ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {(isPending || isConfirming) && <Loader2 size={12} className="spin" />}
            {isPending || isConfirming ? 'Verifying…' : 'Verify transfer'}
          </button>
        )}
      </div>
      {blocked && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
          Creator must transfer Pons fee rights to the splitter first — escrow stays locked until then.
          {!isConnected && ' Connect wallet to run verification.'}
        </div>
      )}
    </div>
  );
};

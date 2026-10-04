# PONS CREATOR FEE FUNDING MARKET
## Product & Protocol Concept Brief for Development

**Status:** Concept approved for prototyping  
**Working name:** TBD  
**Base protocol:** Pons V2  
**Primary chain:** Robinhood Chain  
**V1 funding asset:** ETH  
**Core product:** Pooled launch-expense financing repaid automatically from future Pons creator fees

---

## 1. One-Sentence Concept

Build a marketplace on top of Pons V2 where creators of already-live tokens can raise a small amount of ETH for a specific launch expense, starting with DEX Screener, while lenders fund the request as a pool and are repaid pro-rata from a temporary share of the token's future creator fees.

The core exchange is:

```text
CAPITAL TODAY
↔
TEMPORARY SHARE OF FUTURE CREATOR FEES
```

This is not intended to be a traditional unsecured loan.

It is closer to:

```text
revenue advance
+
live funding market
+
pooled launch financing
```

---

# 2. Problem

Many token creators can launch a token but do not have enough capital immediately afterward to pay for distribution tools such as:

```text
DEX Screener Enhanced Token Info
DEX Screener Ads
Boosts
other approved launch expenses later
```

At the same time, some tokens begin generating trading activity and creator fees very quickly.

The mismatch is:

```text
TOKEN HAS EARLY TRACTION
+
FUTURE CREATOR FEE CASH FLOW

BUT

CREATOR DOES NOT YET HAVE
ENOUGH CASH UPFRONT
```

The platform converts that future creator-fee stream into launch capital today.

---

# 3. Why Build on Pons V2

Pons V2 already provides the primitive needed for enforceable repayment.

Important Pons V2 behavior:

1. Creator fees are not pushed directly to the creator wallet on every trade.
2. Fees accrue and are credited through the Pons fee accounting / escrow system.
3. The current `creatorFeeRecipient` can redirect **future creator payouts** using:

```text
transferCreatorFeeRecipient(token, newRecipient)
```

4. The recipient change applies to future payouts.
5. Balances already credited to the previous recipient do not move.
6. The current recipient controls the next recipient change.

This makes the following structure possible:

```text
CREATOR
↓
temporarily transfers creatorFeeRecipient

FINANCE SPLITTER
↓
becomes current recipient

PONS FUTURE CREATOR FEES
↓
flow to FinanceSplitter

FinanceSplitter
├── lender repayment
├── protocol fee
└── creator share

WHEN REPAYMENT CAP REACHED
↓
FinanceSplitter transfers creatorFeeRecipient
back to creator
```

This is the main lender-protection primitive.

---

# 4. Important Product Reframe

Do not start by financing completely unknown tokens before launch.

The preferred V1 is **post-launch revenue financing**.

Target moment:

```text
TOKEN LAUNCHES ON PONS
↓
EARLY TRADING STARTS
↓
CREATOR FEES BEGIN TO APPEAR
↓
PLATFORM DETECTS EARLY TRACTION
↓
TOKEN BECOMES ELIGIBLE
↓
CREATOR OPENS FUNDING REQUEST
↓
LENDERS FUND CAMPAIGN
```

This gives lenders real onchain data before they deploy capital.

The platform should finance early traction, not blind launches.

---

# 5. Core User Types

## Creator / Borrower

A Pons token creator who:

```text
already has a live token
has early activity
needs launch/distribution capital
is willing to temporarily share future creator fees
```

## Lender / Backer

A user who:

```text
has ETH
wants short-duration high-risk financing opportunities
chooses which live tokens to fund
receives pro-rata creator-fee repayment
can diversify across multiple launches
```

## Platform

The platform:

```text
indexes Pons activity
detects eligible tokens
hosts funding requests
holds lender funds in campaign escrow
enforces fee-recipient transfer
accounts for lender shares
routes creator fees
returns fee rights after repayment
```

---

# 6. Core V1 Product

The first standardized product should be:

```text
DEX SCREENER FUNDING POOL
```

Example:

```text
Campaign:
DEX Screener Enhanced Token Info

Funding target:
~$299 equivalent in ETH

Funding model:
Pooled

Minimum lender contribution:
$10 equivalent

Creator fee repayment:
Temporary share of future creator fees

Repayment cap:
Example 1.20x
```

Use one standardized campaign first.

Do not initially allow creators to request arbitrary amounts for arbitrary reasons.

---

# 7. Why Pooled Funding

A single lender should not be required to risk the full campaign cost.

Example:

```text
TARGET
$299

Lender A     $20
Lender B     $50
Lender C     $25
Lender D     $100
Lender E     $104

TOTAL        $299
```

Each lender owns a pro-rata share of the funding pool.

If the pool has a 1.20x repayment cap:

```text
Total maximum repayment
$358.80
```

A lender who contributed 10% of the pool is entitled to 10% of lender distributions until the pool reaches the repayment cap.

Benefits:

```text
lower individual risk
more retail participation
portfolio diversification
live pool progress / FOMO
faster marketplace activity
```

---

# 8. All-or-Nothing Funding

Every request should have an exact target.

Example:

```text
Target:
0.0X ETH representing the current campaign cost

Pool:
0.0X / 0.0X ETH
```

If the target is reached:

```text
FUNDED
↓
pool closes
↓
campaign execution begins
```

If the funding deadline expires before the target is reached:

```text
EXPIRED
↓
lenders can withdraw / receive full refund
```

Do not deploy partially funded campaigns in V1.

---

# 9. Proposed V1 Economics

These values are **starting hypotheses for testnet/prototyping**, not permanent mainnet parameters.

Recommended initial structure:

```text
Campaign target:
~$299 equivalent

Minimum lender contribution:
$10 equivalent

Optional max contribution per wallet:
$100 equivalent

Funding window:
10–30 minutes

Repayment cap:
1.20x

Future creator fee routing while active:

75% → lender pool
23% → creator
 2% → protocol
```

Alternative creator/lender splits can be tested later.

The reason for keeping a creator share during repayment is to avoid taking 100% of the creator's operating cash flow.

When lender repayment reaches the cap:

```text
FINANCING STATUS = REPAID

creatorFeeRecipient
↓
returned to creator
```

Future creator fees are then no longer routed through the financing deal.

---

# 10. Lender Risk

The protocol should remove as much **fraud risk** as possible.

It cannot remove **market/activity risk**.

The platform can enforce:

```text
creator cannot redirect future fees
while financing is active

creator does not receive unrestricted lender principal

all lenders are accounted pro-rata

creator fee distribution is enforced onchain
```

But the platform cannot guarantee:

```text
the token keeps trading

creator fees remain high

the campaign increases volume

the lender reaches the full repayment cap
```

Example:

```text
Lenders fund $299
↓
campaign launches
↓
token activity collapses
↓
only $80 of future creator fees arrive
```

The lenders may suffer a partial loss.

This risk is part of the product and must be shown clearly in UI.

---

# 11. Underwriting Philosophy

Do not make the platform behave like a bank.

Avoid overly strict approval.

The goal is:

```text
LIGHT GUARDRAILS
+
TRANSPARENT DATA
+
LENDER DECISION
```

The platform should decide whether a request is eligible to list.

The lender decides whether the opportunity is worth funding.

---

# 12. Underwriting Signals

The most important metric is **creator fee cash-flow velocity**, not market cap.

Priority:

```text
1. creator fee velocity
2. trading volume trend
3. unique traders
4. liquidity
5. token age
6. curve / graduation progress
7. market cap as context
```

Market cap should be displayed but should not be the primary eligibility gate.

---

# 13. Suggested Loose V1 Eligibility

Initial prototype thresholds:

```text
Pons V2 token

ETH-paired token only

Token age:
>= 15 minutes

Unique traders:
>= 20

Creator fees generated:
>= $15 equivalent

Creator fee recipient:
must be transferable to FinanceSplitter

No obvious abnormal / invalid activity
```

These values are intentionally permissive.

A token meeting these rules is allowed to create a request.

This does **not** mean the platform guarantees it is safe.

---

# 14. Fee Velocity

The frontend/indexer should calculate rolling creator-fee generation:

```text
5 minutes
15 minutes
1 hour
6 hours
24 hours
```

Example:

```text
5m fees       $8
15m fees     $19
1h fees      $52

Fee velocity:
$52/hr

Trend:
+34% vs previous hour
```

This should be a major lender-facing metric.

The system should distinguish:

```text
ACCELERATING
STABLE
COOLING
```

Do not use a misleading numerical "safety score" in V1.

---

# 15. Pons Data Requirements

The indexer should reconstruct Pons data directly from contracts/events where possible.

Relevant data includes:

```text
token launch
curve address
pair token
creator fee recipient
creator tax
trade history
fees swept
pending creator fees
escrow balances
creator recipient updates
graduation state
reserves / liquidity
```

Important Pons V2 nuance:

Creator revenue can exist in more than one place before claim.

The platform should account for:

```text
pre-graduation:
quoteFeeBalance
creatorTaxBalance

post-graduation:
pendingFees
pendingCreatorTax

plus:
fee escrow balances
```

Do not look only at the escrow balance when calculating creator-fee activity.

For underwriting, historical fee velocity should come from indexed activity rather than treating already-credited balances as new collateral.

---

# 16. Financing Activation Flow

A funding request should not open immediately.

Required sequence:

```text
1. Creator selects eligible Pons token

2. Platform displays live token metrics

3. Creator selects standardized campaign

4. Platform creates FinancingDeal / FinanceSplitter

5. Creator calls Pons:
   transferCreatorFeeRecipient(
      token,
      FinanceSplitter
   )

6. Platform verifies onchain:
   current creatorFeeRecipient
   == FinanceSplitter

7. Funding pool becomes OPEN

8. Lenders may contribute ETH
```

If step 5 or 6 fails:

```text
NO FUNDING REQUEST
```

This is mandatory lender protection.

---

# 17. Funding Pool Lifecycle

Recommended states:

```text
DRAFT

AWAITING_FEE_TRANSFER

OPEN

FILLED

CAMPAIGN_PENDING

ACTIVE_REPAYMENT

REPAID

EXPIRED

CANCELLED

REFUNDABLE
```

Flow:

```text
DRAFT
↓
AWAITING_FEE_TRANSFER
↓
OPEN
↓
FILLED
↓
CAMPAIGN_PENDING
↓
ACTIVE_REPAYMENT
↓
REPAID
```

Failure before capital is deployed:

```text
OPEN
↓
EXPIRED / CANCELLED
↓
REFUNDABLE
```

---

# 18. Campaign Execution Is an External Dependency

Creator-fee repayment can be onchain.

DEX Screener purchasing is not part of Pons and should be treated as an external campaign execution step.

V1 architecture should therefore separate:

```text
ONCHAIN FINANCING

from

OFFCHAIN CAMPAIGN PURCHASE
```

Recommended V1:

```text
FundingPool
↓
CampaignEscrow
↓
approved CampaignExecutor
↓
DEX Screener purchase
```

The lender principal should **not** simply be transferred to the creator wallet.

The campaign executor should only spend funds for the approved campaign.

If the campaign cannot be executed before an execution deadline:

```text
deal becomes refundable
```

If an external vendor payment is refunded:

```text
refund proceeds return to CampaignEscrow
and are returned pro-rata to lenders
```

Later, if a supported vendor offers a secure programmatic integration, campaign execution can be automated.

---

# 19. ETH / USD Campaign Cost

DEX Screener products are USD-priced while lenders contribute ETH.

Therefore the request must store a fixed ETH target for the funding window.

Recommended V1:

```text
campaign USD price
↓
convert to target ETH amount
at request creation
↓
lock target ETH for short funding window
```

The funding window should be short enough that ETH/USD movement does not create large differences.

Optionally include a small predefined execution buffer.

Any unused execution buffer should be returned to the pool or applied to repayment accounting, not silently retained.

---

# 20. FinanceSplitter

This is the core contract.

Each financing deal can use either:

```text
one minimal clone per deal
```

or:

```text
one shared accounting contract
```

A per-deal minimal proxy/cloned splitter is conceptually simple for V1.

Store:

```text
Pons token
original creator recipient
funding pool
principal
repayment cap
total repaid
lender allocation BPS
creator allocation BPS
protocol allocation BPS
status
```

The splitter must be able to:

```text
claim its Pons fee balance

receive native ETH

account lender share

account creator share

account protocol fee

track total lender repayment

finalize financing

return creatorFeeRecipient
to original creator
```

---

# 21. Claiming Pons Fees

Because Pons fees are credited to escrow rather than automatically pushed, the FinanceSplitter needs a function such as:

```text
claimPonsFees()
```

This function can be permissionless.

Concept:

```text
anyone calls claimPonsFees()

FinanceSplitter
↓
calls Pons FeeEscrow claim()

ETH reaches FinanceSplitter

FinanceSplitter
↓
updates repayment accounting
```

Do not require a trusted operator merely to claim fees.

For V1 support only ETH-paired Pons launches so repayment is in native ETH.

Custom pair assets can be added later.

---

# 22. Lender Accounting

Do not loop through every lender every time creator fees arrive.

Use accumulator-based accounting.

Concept:

```text
totalPoolShares
accRepaymentPerShare

each lender:
shares
rewardDebt
claimable
```

When repayment ETH arrives:

```text
lenderAllocation
↓
accRepaymentPerShare increases
```

Each lender later calls:

```text
claimRepayment()
```

This keeps gas usage independent of lender count.

---

# 23. Repayment Completion

Example:

```text
Principal:
10 ETH-equivalent units

Repayment cap:
1.20x

Maximum lender repayment:
12 units
```

When:

```text
totalLenderRepayment >= repaymentCap
```

then:

```text
status = REPAID
```

The splitter should cap the final lender allocation precisely.

Any creator fee received above the remaining lender entitlement should go to the creator/protocol according to the finalization rule.

Then:

```text
FinanceSplitter
↓
calls Pons transferCreatorFeeRecipient
↓
original creator becomes recipient again
```

Finalization should be permissionless once repayment conditions are met.

---

# 24. Pool Contribution UX

Live request card:

```text
$TOKEN

Age
42m

Fee velocity
$48/hr

Liquidity
$9.8K

Unique traders
64

Campaign
DEX Screener Paid

POOL
$215 / $299

Lender fee share
75%

Repayment cap
1.20x

[ FUND ]
```

Contribution modal:

```text
Contribution
$25

Pool ownership
8.36%

Maximum repayment*
$30

Recent fee velocity
$48/hr

[ CONFIRM FUNDING ]

*Maximum if the deal fully repays.
Not guaranteed.
```

---

# 25. Marketplace Experience

The lender side should feel like a live opportunity feed.

Not like a traditional lending dashboard.

Tabs:

```text
LIVE
MOMENTUM
HOT
RECENTLY FUNDED
REPAYING
REPAID
```

Examples:

```text
NEW REQUEST
12 seconds ago

POOL 37% FILLED
```

The speed and scarcity are part of the product.

Users compete for allocation in attractive financing pools before they fill.

---

# 26. Creator UX

Creator flow:

```text
CONNECT WALLET
↓
SELECT MY PONS TOKEN
↓
VIEW ELIGIBILITY
↓
CHOOSE CAMPAIGN
↓
VIEW TERMS
↓
TRANSFER CREATOR FEE RECIPIENT
↓
CREATE REQUEST
↓
POOL OPENS
↓
FUNDED
↓
CAMPAIGN EXECUTED
↓
REPAYMENT LIVE
↓
REPAID
↓
FEE RIGHTS RETURNED
```

Creator dashboard:

```text
campaign status
funding progress
creator fees generated
amount paid to lenders
remaining lender repayment
creator share earned
estimated completion based on recent fees
```

---

# 27. Lender Portfolio

Lender dashboard:

```text
ACTIVE POSITIONS

$ABC
Contributed      0.01 ETH
Repaid           64%
Claimable        0.002 ETH

$DOG
Contributed      0.02 ETH
Repaid           100%
Status           REPAID

$CAT
Contributed      0.015 ETH
Repaid           12%
Status           COOLING
```

Portfolio metrics:

```text
capital deployed
capital repaid
claimable ETH
active positions
fully repaid deals
partial/defaulted deals
```

---

# 28. Definition of Default

Avoid pretending default is identical to bank debt.

Suggested V1 definitions:

```text
ACTIVE
future creator fees are still being generated

STALLED
no meaningful creator-fee activity
for a configurable period

PARTIAL
campaign expired economically
but lenders received some repayment

UNRECOVERED
activity has effectively stopped
before full cap was reached

REPAID
full lender repayment cap reached
```

A market failure does not automatically imply creator fraud.

Keep:

```text
FRAUD / BYPASS ATTEMPT
```

separate from:

```text
TOKEN ACTIVITY COLLAPSED
```

---

# 29. Flywheel

## Creator Flywheel

```text
PONS LAUNCH
↓
EARLY TRACTION
↓
BECOMES FINANCEABLE
↓
RAISE LAUNCH BUDGET
↓
BUY DISTRIBUTION
↓
MORE ATTENTION POTENTIAL
↓
MORE TRADING POTENTIAL
↓
MORE CREATOR FEES
↓
REPAY LENDERS
```

Advertising must never be represented as guaranteeing additional volume.

## Lender Flywheel

```text
ETH CAPITAL
↓
FUND MULTIPLE POOLS
↓
RECEIVE CREATOR-FEE REPAYMENT
↓
CLAIM ETH
↓
CAPITAL RETURNS
↓
FUND NEXT REQUEST
```

## Marketplace Flywheel

```text
MORE PONS LAUNCHES
↓
MORE QUALIFIED REQUESTS
↓
MORE LENDER OPPORTUNITIES
↓
MORE CAPITAL WATCHING MARKET
↓
FASTER POOL FILLS
↓
MORE CREATORS USE PLATFORM
```

---

# 30. Smart Contract Modules

Suggested V1:

```text
FundingFactory
│
├── creates FundingPool / FinanceSplitter
│
└── stores global configuration

FundingPool
│
├── accepts lender ETH
├── tracks shares
├── all-or-nothing target
├── expiry
└── refund logic

FinanceSplitter
│
├── current Pons creatorFeeRecipient
├── claims Pons creator fees
├── lender accumulator
├── creator allocation
├── protocol allocation
├── repayment cap
└── returns fee recipient after repayment

CampaignEscrow
│
├── holds funded principal
├── releases only for approved campaign
└── handles refundable execution failures

ProtocolTreasury
└── receives platform fees
```

The final contract count can be simplified during implementation.

---

# 31. Offchain Services

## Pons Indexer

Indexes:

```text
Pons launches
trades
fee events
fee recipient changes
graduations
reserves
pending fees
escrow credits
```

## Market Analytics Service

Calculates:

```text
fee velocity
volume trend
unique traders
token age
liquidity
market cap
curve progress
activity state
```

## Campaign Executor

V1 external execution layer for approved DEX Screener purchases.

## Notification Service

Later:

```text
website notifications
Telegram
Discord
X bot
```

Example:

```text
NEW FUNDING REQUEST

$ABC
Fee velocity: $48/hr
Target: $299
Pool: 0%

Fund now
```

---

# 32. V1 Pages

```text
/
Landing / live market

/market
All funding requests

/request/[id]
Funding request detail

/create
Creator funding request flow

/portfolio
Lender positions

/creator
Creator deals

/activity
Funded / repaid / campaign activity
```

Optional later:

```text
/analytics
```

---

# 33. V1 Scope — Build This

```text
Pons V2 ETH-pair support

Pons token discovery

basic eligibility

creator fee velocity

FundingPool

pooled lender contributions

all-or-nothing funding

FinanceSplitter

creator fee recipient transfer verification

Pons fee claiming

pro-rata lender repayment

creator share

protocol fee

campaign escrow

semi-manual DEX Screener execution

repayment completion

return creator fee recipient

refund path

live market UI

creator dashboard

lender portfolio
```

---

# 34. Do NOT Build Yet

```text
generic lending

collateral loans

reputation system

credit scores

AI underwriting

arbitrary campaign requests

multiple launchpads

custom-pair Pons tokens

automated portfolio strategies

auto-funding bots

secondary market for positions

tokenized lender positions

protocol token

DAO

complex insurance

full launchpad
```

---

# 35. Security / Failure Cases

Must handle:

```text
creator never transfers fee recipient

recipient changes unexpectedly

pool fails to fill

campaign cannot execute

campaign executor failure

vendor refunds payment

Pons fee claim failure

creator fees stop

multiple lender claims

double claim

reentrancy

rounding / dust

final repayment exceeds cap

recipient-return failure

ETH price movement during funding window

indexer stale data
```

Critical invariant:

```text
Once funding is deployed,
the creator cannot independently redirect
future creator fees away from FinanceSplitter.
```

The FinanceSplitter itself should only release creator-fee control according to valid protocol states.

---

# 36. Trust Boundaries

## Onchain / enforceable

```text
pool contributions
lender ownership
funding target
refund rights
FinanceSplitter ownership of future creator-fee recipient
repayment accounting
lender claims
creator share
protocol fee
repayment cap
return of creator-fee rights
```

## External / operational in V1

```text
DEX Screener checkout
campaign activation
vendor processing
USD/ETH conversion execution
```

The UI must not represent external execution as trustless.

---

# 37. Development Sequence

## Phase 0 — Pons Integration Prototype

```text
read creatorFeeRecipient

read pending / accrued fee information

transfer creatorFeeRecipient to test splitter

claim fees through splitter

return recipient to creator
```

This is the first technical proof required.

If this flow does not work reliably, stop before building the full marketplace.

## Phase 1 — Funding Contracts

```text
FundingPool
FinanceSplitter
lender shares
refunds
repayment accounting
```

## Phase 2 — Indexer + Eligibility

```text
Pons event indexer
fee velocity
unique traders
liquidity
token age
```

## Phase 3 — Frontend

```text
live funding feed
request detail
creator request flow
lender contribution flow
portfolio
```

## Phase 4 — Campaign Execution

```text
CampaignEscrow
operator workflow
vendor purchase proof
execution status
failure/refund handling
```

## Phase 5 — Testnet / Controlled Mainnet Pilot

Start with:

```text
small number of campaigns
small funding caps
manual campaign verification
full monitoring
```

Only expand after observing actual repayment behavior.

---

# 38. Primary Metrics After Launch

Do not judge only by TVL.

Track:

```text
funding requests created

eligible tokens

pool fill rate

median time to fill

capital deployed

average lender contribution

unique lenders

creator fee velocity at funding

median repayment time

full repayment rate

partial repayment rate

unrecovered capital rate

capital recycled by lenders

repeat lenders

repeat creators

campaign execution success
```

The most important proof of product-market fit is:

```text
LENDERS GET REPAID
↓
AND
REDEPLOY CAPITAL
```

---

# 39. Product Personality

The frontend should feel:

```text
premium
clean
financial
fast
live
credible
slightly degen
not bank-like
not casino-like
not AI-generated
```

Visual references can use:

```text
institutional market UI
live opportunity feeds
editorial typography
high-quality scroll motion
clear transaction states
strong data hierarchy
```

Avoid:

```text
generic DeFi gradients
neon overload
AI-generated icons
fake institutional complexity
too many dashboards
```

---

# 40. Final Mental Model

For creators:

> Get launch capital now. Repay it from the fees your token earns later.

For lenders:

> Fund live launches with small allocations and receive a temporary share of creator-fee cash flow.

For the protocol:

```text
PONS TRACTION
↓
FINANCING REQUEST
↓
POOLED ETH CAPITAL
↓
CAMPAIGN EXECUTION
↓
FUTURE CREATOR FEES
↓
AUTOMATIC REPAYMENT
↓
CAPITAL RECYCLED
```

The core primitive is not an unsecured loan.

It is:

> **a marketplace for advancing future Pons creator-fee revenue into launch capital today.**

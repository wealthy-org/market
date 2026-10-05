// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./FundingPoolDeployer.sol";
import "./interfaces/IPonsV2.sol";

interface IEthUsdFeed {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

/**
 * @title FundingPoolFactory
 * @notice Deploys standardized launch funding pools, gated by an onchain eligibility attestation (brief #13)
 * and sized from an ETH/USD feed (brief #19).
 *
 * @dev The indexer (operator) attests the measured token metrics; thresholds are enforced onchain so the
 * operator cannot list a token that fails the published rules. Metrics are stored for transparency.
 */
contract FundingPoolFactory {
    address public immutable ponsFactory;
    address public immutable protocolTreasury;
    address public immutable operator;
    FundingPoolDeployer public immutable deployer;

    // --- Eligibility thresholds (brief #13) ---
    uint256 public constant MIN_TOKEN_AGE = 15 minutes;
    uint256 public constant MIN_UNIQUE_TRADERS = 20;
    uint256 public constant MIN_CREATOR_FEES_USD_CENTS = 1500; // $15
    uint256 public constant ATTESTATION_TTL = 1 hours;

    // --- Standardized pool economics (brief #9) ---
    uint256 public constant CAMPAIGN_USD_CENTS = 29900;     // $299
    uint256 public constant MIN_CONTRIBUTION_USD_CENTS = 1000;  // $10
    uint256 public constant MAX_CONTRIBUTION_USD_CENTS = 10000; // $100
    uint256 public constant MAX_ORACLE_AGE = 1 hours;

    // Fallback sizing when no feed is configured (testnet): ~$300 at the 2500 USD reference
    uint256 public defaultTargetEth = 0.12 ether;
    uint256 public defaultMinContribution = 0.004 ether;
    uint256 public defaultMaxContribution = 0.04 ether;
    uint256 public defaultFundingWindow = 20 minutes;
    uint256 public defaultRepaymentCapMultiplierBps = 12000; // 1.20x
    uint256 public defaultLenderShareBps = 7500;  // 75%
    uint256 public defaultCreatorShareBps = 2300; // 23%  (protocol: 2%)

    IEthUsdFeed public ethUsdFeed; // optional

    struct Eligibility {
        uint256 tokenAgeSeconds;
        uint256 uniqueTraders;
        uint256 creatorFeesUsdCents;
        bool ethPair;
        uint256 attestedAt;
    }

    mapping(address => Eligibility) public eligibility;

    address[] public allPools;
    mapping(address => address[]) public poolsByCreator;
    mapping(address => address[]) public poolsByToken;

    event EligibilityAttested(
        address indexed token,
        uint256 tokenAgeSeconds,
        uint256 uniqueTraders,
        uint256 creatorFeesUsdCents
    );
    event PoolCreated(
        address indexed poolAddress,
        address indexed token,
        address indexed creator,
        uint256 targetEth,
        uint256 fundingWindow
    );
    event EthUsdFeedSet(address feed);

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator");
        _;
    }

    constructor(address _ponsFactory, address _protocolTreasury, address _operator, address _deployer) {
        require(_ponsFactory != address(0), "Invalid factory");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_operator != address(0), "Invalid operator");
        require(_deployer != address(0), "Invalid deployer");

        ponsFactory = _ponsFactory;
        protocolTreasury = _protocolTreasury;
        operator = _operator;
        deployer = FundingPoolDeployer(_deployer);
        deployer.bindFactory(address(this));
    }

    function setEthUsdFeed(address feed) external onlyOperator {
        ethUsdFeed = IEthUsdFeed(feed);
        emit EthUsdFeedSet(feed);
    }

    // ------------------------------------------------------------------
    // Eligibility
    // ------------------------------------------------------------------

    /// @notice Indexer attests measured token metrics. Reverts if the token fails the published thresholds.
    function attestEligibility(
        address token,
        uint256 tokenAgeSeconds,
        uint256 uniqueTraders,
        uint256 creatorFeesUsdCents,
        bool ethPair
    ) external onlyOperator {
        require(token != address(0), "Invalid token");
        require(ethPair, "ETH-paired tokens only");
        require(tokenAgeSeconds >= MIN_TOKEN_AGE, "Token too new");
        require(uniqueTraders >= MIN_UNIQUE_TRADERS, "Not enough unique traders");
        require(creatorFeesUsdCents >= MIN_CREATOR_FEES_USD_CENTS, "Creator fees too low");

        eligibility[token] = Eligibility(tokenAgeSeconds, uniqueTraders, creatorFeesUsdCents, ethPair, block.timestamp);
        emit EligibilityAttested(token, tokenAgeSeconds, uniqueTraders, creatorFeesUsdCents);
    }

    function isEligible(address token) public view returns (bool) {
        Eligibility memory e = eligibility[token];
        return e.attestedAt != 0 && block.timestamp <= e.attestedAt + ATTESTATION_TTL;
    }

    // ------------------------------------------------------------------
    // Pricing
    // ------------------------------------------------------------------

    /// @notice ETH amount for a USD-cent amount using the feed, or the fixed fallback ratio when unset.
    function usdCentsToEth(uint256 usdCents, uint256 fallbackEth) public view returns (uint256) {
        if (address(ethUsdFeed) == address(0)) return fallbackEth;
        (, int256 answer, , uint256 updatedAt, ) = ethUsdFeed.latestRoundData();
        require(answer > 0, "Bad oracle price");
        require(block.timestamp - updatedAt <= MAX_ORACLE_AGE, "Stale oracle price");
        uint256 dec = ethUsdFeed.decimals();
        // eth = usdCents/100 USD / (answer / 10^dec) USD per ETH
        return (usdCents * (10 ** dec) * 1e18) / (uint256(answer) * 100);
    }

    function quoteTargetEth() public view returns (uint256) {
        return usdCentsToEth(CAMPAIGN_USD_CENTS, defaultTargetEth);
    }

    // ------------------------------------------------------------------
    // Pool creation
    // ------------------------------------------------------------------

    /// @notice Deploy a new standardized funding pool for an eligible Pons token.
    /// @dev Caller must currently be the token's Pons creator fee recipient (so it can be transferred).
    /// The target is priced at creation from the ETH/USD feed and locked for the short funding window.
    function createPool(address _token, uint256 _fundingWindow) external returns (address poolAddress) {
        require(_token != address(0), "Invalid token address");
        require(isEligible(_token), "Token not eligible");
        require(
            IPonsV2(ponsFactory).getCreatorFeeRecipient(_token) == msg.sender,
            "Caller is not creator fee recipient"
        );

        uint256 window = _fundingWindow > 0 ? _fundingWindow : defaultFundingWindow;
        uint256 target = quoteTargetEth();
        uint256 minC = usdCentsToEth(MIN_CONTRIBUTION_USD_CENTS, defaultMinContribution);
        uint256 maxC = usdCentsToEth(MAX_CONTRIBUTION_USD_CENTS, defaultMaxContribution);

        poolAddress = deployer.deployPool(
            _token,
            msg.sender,
            ponsFactory,
            protocolTreasury,
            operator,
            target,
            minC,
            maxC,
            window,
            defaultRepaymentCapMultiplierBps,
            defaultLenderShareBps,
            defaultCreatorShareBps
        );
        allPools.push(poolAddress);
        poolsByCreator[msg.sender].push(poolAddress);
        poolsByToken[_token].push(poolAddress);

        emit PoolCreated(poolAddress, _token, msg.sender, target, window);
    }

    /// @notice Returns total number of pools created
    function totalPools() external view returns (uint256) {
        return allPools.length;
    }

    /// @notice Returns all created pools
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }

    /// @notice Returns pools created by a specific creator
    function getPoolsByCreator(address _creator) external view returns (address[] memory) {
        return poolsByCreator[_creator];
    }

    /// @notice Returns pools created for a specific token
    function getPoolsByToken(address _token) external view returns (address[] memory) {
        return poolsByToken[_token];
    }
}

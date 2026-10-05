// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./FundingPool.sol";

/**
 * @title FundingPoolFactory
 * @notice Factory for deploying and tracking standardized launch funding pools.
 */
contract FundingPoolFactory {
    address public immutable ponsFactory;
    address public immutable protocolTreasury;
    address public immutable operator;

    // Standardized pool defaults
    uint256 public defaultTargetEth = 0.12 ether; // ~$300 at standard ETH reference
    uint256 public defaultMinContribution = 0.004 ether; // ~$10
    uint256 public defaultDuration = 86400; // 24 hours
    uint256 public defaultRepaymentCapMultiplierBps = 12000; // 1.20x
    uint256 public defaultLenderShareBps = 7000; // 70%
    uint256 public defaultCreatorShareBps = 2500; // 25%

    address[] public allPools;
    mapping(address => address[]) public poolsByCreator;
    mapping(address => address[]) public poolsByToken;

    event PoolCreated(
        address indexed poolAddress,
        address indexed token,
        address indexed creator,
        uint256 targetEth,
        uint256 deadline
    );

    constructor(
        address _ponsFactory,
        address _protocolTreasury,
        address _operator
    ) {
        require(_ponsFactory != address(0), "Invalid factory");
        require(_protocolTreasury != address(0), "Invalid treasury");
        require(_operator != address(0), "Invalid operator");

        ponsFactory = _ponsFactory;
        protocolTreasury = _protocolTreasury;
        operator = _operator;
    }

    /// @notice Deploy a new standardized funding pool for a Pons token
    function createPool(
        address _token,
        uint256 _targetEth,
        uint256 _durationSeconds
    ) external returns (address poolAddress) {
        require(_token != address(0), "Invalid token address");

        uint256 target = _targetEth > 0 ? _targetEth : defaultTargetEth;
        uint256 duration = _durationSeconds > 0 ? _durationSeconds : defaultDuration;

        FundingPool newPool = new FundingPool(
            _token,
            msg.sender,
            ponsFactory,
            protocolTreasury,
            operator,
            target,
            defaultMinContribution,
            duration,
            defaultRepaymentCapMultiplierBps,
            defaultLenderShareBps,
            defaultCreatorShareBps
        );

        poolAddress = address(newPool);
        allPools.push(poolAddress);
        poolsByCreator[msg.sender].push(poolAddress);
        poolsByToken[_token].push(poolAddress);

        emit PoolCreated(
            poolAddress,
            _token,
            msg.sender,
            target,
            block.timestamp + duration
        );
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./FundingPool.sol";

/**
 * @title FundingPoolDeployer
 * @notice Holds the FundingPool creation code so FundingPoolFactory stays under the 24KB contract size limit.
 * @dev Callable only by the single factory bound on first use.
 */
contract FundingPoolDeployer {
    address public factory;

    function bindFactory(address _factory) external {
        require(factory == address(0), "Already bound");
        require(_factory != address(0), "Invalid factory");
        factory = _factory;
    }

    function deployPool(
        address token,
        address creator,
        address ponsFactory,
        address protocolTreasury,
        address operator,
        uint256 targetEth,
        uint256 minContribution,
        uint256 maxContribution,
        uint256 fundingWindow,
        uint256 capBps,
        uint256 lenderBps,
        uint256 creatorBps
    ) external returns (address) {
        require(msg.sender == factory, "Only factory");
        return address(
            new FundingPool(
                token,
                creator,
                ponsFactory,
                protocolTreasury,
                operator,
                targetEth,
                minContribution,
                maxContribution,
                fundingWindow,
                capBps,
                lenderBps,
                creatorBps
            )
        );
    }
}

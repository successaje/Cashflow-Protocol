// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CashflowPool.sol";

contract CashflowPoolFactory {
    address public owner;
    address public oracleAddress;
    address public stablecoin; // e.g., USDT on BNB

    CashflowPool[] public allPools;

    event PoolCreated(
        address indexed poolAddress,
        address indexed businessAddress,
        string tokenName,
        string tokenSymbol
    );

    constructor(address _stablecoin, address _oracleAddress) {
        owner = msg.sender;
        stablecoin = _stablecoin;
        oracleAddress = _oracleAddress;
    }

    /**
     * @notice Create a new Cashflow Pool for a business
     */
    function createPool(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _fundingTarget,
        uint256 _fundDurationDays,
        uint256 _revenueSharePercentage
    ) external returns (address) {
        CashflowPool newPool = new CashflowPool(
            stablecoin,
            msg.sender, // business address
            oracleAddress,
            _tokenName,
            _tokenSymbol,
            _fundingTarget,
            _fundDurationDays,
            _revenueSharePercentage
        );

        allPools.push(newPool);

        emit PoolCreated(
            address(newPool),
            msg.sender,
            _tokenName,
            _tokenSymbol
        );

        return address(newPool);
    }

    function getPoolsCount() external view returns (uint256) {
        return allPools.length;
    }
}

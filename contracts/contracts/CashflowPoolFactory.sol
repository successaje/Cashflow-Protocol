// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./CashflowPool.sol";

contract CashflowPoolFactory {
    using SafeERC20 for IERC20;

    address public owner;
    address public oracleAddress;
    address public stablecoin; // e.g., USDT on BNB
    uint256 public minStakePercentage = 1000; // 10% (scaled by 10000)

    CashflowPool[] public allPools;

    event PoolCreated(
        address indexed poolAddress,
        address indexed businessAddress,
        string tokenName,
        string tokenSymbol,
        uint256 stakedAmount
    );

    constructor(address _stablecoin, address _oracleAddress) {
        owner = msg.sender;
        stablecoin = _stablecoin;
        oracleAddress = _oracleAddress;
    }

    /**
     * @notice Create a new Cashflow Pool for a business
     * @param _stakeAmount The collateral amount the business provides
     */
    function createPool(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _fundingTarget,
        uint256 _fundDurationDays,
        uint256 _revenueSharePercentage,
        uint256 _stakeAmount
    ) external returns (address) {
        uint256 requiredStake = (_fundingTarget * minStakePercentage) / 10000;
        require(_stakeAmount >= requiredStake, "Insufficient stake amount");

        CashflowPool newPool = new CashflowPool(
            stablecoin,
            msg.sender, // business address
            oracleAddress,
            _tokenName,
            _tokenSymbol,
            _fundingTarget,
            _fundDurationDays,
            _revenueSharePercentage,
            _stakeAmount
        );

        // Transfer stake from business to the pool contract
        SafeERC20.safeTransferFrom(IERC20(stablecoin), msg.sender, address(newPool), _stakeAmount);

        allPools.push(newPool);

        emit PoolCreated(
            address(newPool),
            msg.sender,
            _tokenName,
            _tokenSymbol,
            _stakeAmount
        );

        return address(newPool);
    }

    function getPoolsCount() external view returns (uint256) {
        return allPools.length;
    }
}

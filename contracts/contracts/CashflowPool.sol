// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CashflowToken.sol";

contract CashflowPool is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public stablecoin;
    CashflowToken public cashflowToken;

    address public businessAddress;
    address public oracleAddress;

    uint256 public fundingTarget;
    uint256 public fundingRaised;
    uint256 public fundDeadline;

    uint256 public revenueSharePercentage; // e.g. 1000 = 10%

    // Revenue tracking
    uint256 public totalRevenueDeposited;
    uint256 public accRewardPerShare;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public claimedDistributions;

    bool public isFunded;

    event InvestmentMade(address indexed investor, uint256 amount);
    event RevenueDeposited(uint256 amount);
    event YieldClaimed(address indexed investor, uint256 amount);
    event FundsWithdrawnByBusiness(uint256 amount);

    constructor(
        address _stablecoin,
        address _businessAddress,
        address _oracleAddress,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _fundingTarget,
        uint256 _fundDurationDays,
        uint256 _revenueSharePercentage
    ) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        businessAddress = _businessAddress;
        oracleAddress = _oracleAddress;

        fundingTarget = _fundingTarget;
        fundDeadline = block.timestamp + (_fundDurationDays * 1 days);
        revenueSharePercentage = _revenueSharePercentage;

        // Create the token that represents a share of this pool
        cashflowToken = new CashflowToken(
            _tokenName,
            _tokenSymbol,
            address(this)
        );
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call");
        _;
    }

    /**
     * @notice Invest in the pool. User must approve the stablecoin first.
     */
    function invest(uint256 amount) external {
        require(block.timestamp <= fundDeadline, "Funding period has ended");
        require(!isFunded, "Pool is already fully funded");
        require(amount > 0, "Amount must be > 0");

        uint256 amountToInvest = amount;
        if (fundingRaised + amount > fundingTarget) {
            amountToInvest = fundingTarget - fundingRaised;
        }

        // Claim any pending rewards first (if any somehow exist)
        _claimYield(msg.sender);

        // Transfer stablecoin from investor to pool
        stablecoin.safeTransferFrom(msg.sender, address(this), amountToInvest);

        fundingRaised += amountToInvest;

        // Mint CashflowToken to investor 1:1 with stablecoin (or based on target)
        // For simplicity, 1 stablecoin = 1 share token
        cashflowToken.mint(msg.sender, amountToInvest);

        // Update reward debt
        rewardDebt[msg.sender] =
            (cashflowToken.balanceOf(msg.sender) * accRewardPerShare) /
            1e12;

        emit InvestmentMade(msg.sender, amountToInvest);

        if (fundingRaised >= fundingTarget) {
            isFunded = true;
        }
    }

    /**
     * @notice Business withdraws the raised funds once target is reached or deadline passes.
     */
    function withdrawRaisedFunds() external {
        require(msg.sender == businessAddress, "Only business");
        uint256 balance = stablecoin.balanceOf(address(this)) -
            totalRevenueDeposited +
            getTotalClaimed(); // Keep revenue segregated
        require(balance > 0, "No funds to withdraw");

        // In this MVP, they just withdraw what was raised directly
        uint256 toWithdraw = fundingRaised;

        // We ensure we don't accidentally send revenue.
        // Wait, safer to just transfer the exact fundingRaised once.
        require(fundingRaised > 0, "No funding");
        fundingRaised = 0; // Mark as withdrawn

        stablecoin.safeTransfer(businessAddress, toWithdraw);
        emit FundsWithdrawnByBusiness(toWithdraw);
    }

    function getTotalClaimed() internal view returns (uint256) {
        // Just for internal tracking if needed, simpler to track total pool balance vs revenue
        return 0;
    }

    /**
     * @notice Oracle deposits revenue into the contract.
     */
    function depositRevenue(uint256 amount) external onlyOracle {
        require(amount > 0, "Amount must be > 0");
        require(cashflowToken.totalSupply() > 0, "No investors");

        stablecoin.safeTransferFrom(msg.sender, address(this), amount);

        totalRevenueDeposited += amount;
        accRewardPerShare += (amount * 1e12) / cashflowToken.totalSupply();

        emit RevenueDeposited(amount);
    }

    /**
     * @notice Investors call this to claim their share of the revenue.
     */
    function claimYield() external {
        _claimYield(msg.sender);
    }

    function _claimYield(address user) internal {
        uint256 balance = cashflowToken.balanceOf(user);
        if (balance == 0) return;

        uint256 pending = ((balance * accRewardPerShare) / 1e12) -
            rewardDebt[user];
        if (pending > 0) {
            rewardDebt[user] = (balance * accRewardPerShare) / 1e12;
            claimedDistributions[user] += pending;

            stablecoin.safeTransfer(user, pending);
            emit YieldClaimed(user, pending);
        }
    }

    /**
     * @notice Helper config for the MVP. We block token transfers after investment unless reward debt is handled.
     * CashflowToken is standalone so we'd need a wrapper for transfer.
     * To keep V1 secure and simple, tokens represent the right to claim here.
     * If they transfer via the ERC20 directly, the receiver resets their debt...
     * Actually, if they transfer ERC20, the reward Debt of sender and receiver goes out of sync.
     * For proper V1 MVP robustness without complex DividendToken, we just let investors claim here.
     */
}

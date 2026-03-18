// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CashflowToken
 * @dev ERC20 Token representing a share of future revenue from a specific Cashflow Pool.
 * The token is unique per pool. It can only be minted by the pool itself during the funding phase.
 */
contract CashflowToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {}

    /**
     * @dev Mint tokens to an investor. Only callable by the pool (which is the owner).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

// SPDX-License-Identifier: MIT
//https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract FoxGhostToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor() ERC20("FoxGhostToken", "FGT") ERC20Permit("FoxGhostToken") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

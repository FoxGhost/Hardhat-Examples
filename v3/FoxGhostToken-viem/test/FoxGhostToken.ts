import assert from "node:assert/strict";
import { describe, it } from "node:test";

import hre, { network } from "hardhat";
import { error } from "node:console";
import { getAddress } from "viem";
import { get } from "node:http";
const { networkHelpers } = await hre.network.connect();

/* Fixtures
* * fixtures can be used importing
* * const { networkHelpers } = await hre.network.connect();
* * and then await networkHelpers.loadFixture(fixtureName);
* * but with hardhat 3 and Node.js test runner the tests run in parallel.
* * So the test even if starting from the same state thanks to the fixture,
* * are also using the same contract instance (due to the fixture behavior) so they influence each other
* * because they run in parallel.
* *
* * If this code is run using fixtures, some tests will fail because the previous test influences the following one
* * due to the parallelism. This means that the fixture works correctly, but then the tests
* * that are running on the same contract instance are influencing each other
* */

describe("FoxGhostToken", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  const totalSupply = BigInt(1000);
  const value = BigInt(5)


  async function deployContract() {
    const [owner, addr1, addr2] = await viem.getWalletClients();

    const Token = await viem.deployContract("FoxGhostToken", [owner.account.address]);
    //await ethers.constructor();
    await Token.write.mint([getAddress(owner.account.address), totalSupply]);

    // Fixtures can return anything you consider useful for your tests
    return { Token, owner, addr1, addr2 };
  }

  it('Test Name', async function(){
    const { Token: token } = await deployContract();
    assert.equal(await token.read.name(), "FoxGhostToken");

  });

  it('Test Symbol', async function(){
    const { Token } = await deployContract();
    assert.equal(await Token.read.symbol(), "FGT");
  });

  it('Test Decimals', async function(){
        const { Token } = await deployContract();
        assert.equal(await Token.read.decimals(), 18);
    });

    it('Total Supply', async function(){
        const { Token } = await deployContract();
        assert.equal(await Token.read.totalSupply(), totalSupply);
    });


    it('Test Mint: Balance of the deployer', async function(){
        const { Token, owner } = await deployContract();
        assert.equal(await Token.read.balanceOf([getAddress(owner.account.address)]), totalSupply);
    });

    it('Test Mint: Mint to a user', async function(){
        const { Token, owner, addr1 } = await deployContract();
        await Token.write.mint([getAddress(addr1.account.address), value], {account: owner.account});

        assert.equal(await Token.read.balanceOf([addr1.account.address]), value);
    });

    it('Test Transfer: Owner pays user', async function(){
        const { Token, owner, addr1 } = await deployContract();
        await Token.write.transfer([getAddress(addr1.account.address), value], {account: owner.account});
        assert.equal(await Token.read.balanceOf([getAddress(addr1.account.address)]), value);
    });

    it('Test Transfer: User pays user', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await Token.write.transfer([getAddress(addr1.account.address), value], {account: owner.account});
        await Token.write.transfer([getAddress(addr2.account.address), value], {account: addr1.account.address});
        assert.equal(await Token.read.balanceOf([getAddress(addr2.account.address)]), value);
    });

    it('Test Burn', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await Token.write.transfer([getAddress(addr1.account.address), value], {account: owner.account});
        await Token.write.burn([value], {account: addr1.account});
        assert.equal(await Token.read.balanceOf([getAddress(addr1.account.address)]), BigInt(0));
    });

    it('Test Approve: spend all in one', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await Token.write.approve([getAddress(addr1.account.address), value], {account: owner.account});
        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), value], {account: addr1.account});
        assert.equal(await Token.read.balanceOf([getAddress(addr2.account.address)]), value);
    });

    it('Test Approve: spend all in many', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await Token.write.approve([getAddress(addr1.account.address), value], {account: owner.account});

        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});
        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});
        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});
        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});
        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});

        assert.equal(await Token.read.balanceOf([getAddress(addr2.account.address)]), value);
    });

    it('Test Approve: spend not all', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await Token.write.approve([getAddress(addr1.account.address), value], {account: owner.account});

        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});
        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});
        await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});

        assert.equal(await Token.read.balanceOf([getAddress(addr2.account.address)]), BigInt(3));
    });

    it('Test Approve: spend more than allowed', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await Token.write.approve([getAddress(addr1.account.address), value], {account: owner.account});

        for (let i = 0; i < value; i++) {
          await Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account});
        }

        await viem.assertions.revertWithCustomError(
          Token.write.transferFrom([getAddress(owner.account.address), getAddress(addr2.account.address), BigInt(1)], {account: addr1.account}),
          Token,
          'ERC20InsufficientAllowance'
        );
    });

    it('Test Approve: BurnFrom', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await Token.write.transfer([getAddress(addr1.account.address), value], {account: owner.account});
        await Token.write.approve([getAddress(owner.account.address), value], {account: addr1.account});
        await Token.write.burnFrom([getAddress(addr1.account.address), value], {account: owner.account});
        await assert.equal(await Token.read.balanceOf([addr1.account.address]), BigInt(0));
    });

    it('Test Allowance', async function(){
        const { Token, owner, addr1 } = await deployContract();
        await Token.write.approve([getAddress(addr1.account.address), value], {account: owner.account});

        assert.equal(await Token.read.allowance([getAddress(owner.account.address), addr1.account.address]), value);
    });

    it('Test 0 address: transfer', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();

        await viem.assertions.revertWithCustomError(
          Token.write.transfer(['0x0000000000000000000000000000000000000000', value], { account: owner.account.address }),
          Token,
          'ERC20InvalidReceiver'
        );
    });

    it('Test 0 address: transferFrom: to', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await Token.write.approve([getAddress(addr1.account.address), value], {account: owner.account});

        await viem.assertions.revertWithCustomError(
          Token.write.transferFrom([getAddress(owner.account.address), '0x0000000000000000000000000000000000000000', value], {account: addr1.account}),
          Token,
          'ERC20InvalidReceiver'
        );
    });

    it('Test 0 address: approve: from', async function(){
        const { Token, owner, addr1, addr2 } = await deployContract();
        await viem.assertions.revertWithCustomError(
          Token.write.approve(['0x0000000000000000000000000000000000000000', value], {account: owner.account}),
          Token,
          'ERC20InvalidSpender'
        );
    });

    it('Test Events: Transfer', async function(){
        const { Token, owner, addr1 } = await deployContract();
        await viem.assertions.emitWithArgs(Token.write.transfer([getAddress(addr1.account.address), value], {account: owner.account}), Token, 'Transfer', [getAddress(owner.account.address), getAddress(addr1.account.address), value]);
    });

    it('Test Events: Approval', async function(){
        const { Token, owner, addr1 } = await deployContract();
        await viem.assertions.emitWithArgs(
          Token.write.approve([getAddress(addr1.account.address), value], {account: owner.account}), 
          Token,
          'Approval', 
          [getAddress(owner.account.address), getAddress(addr1.account.address), value]
        );
    });

});

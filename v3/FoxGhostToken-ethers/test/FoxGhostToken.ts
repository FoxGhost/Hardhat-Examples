import { expect } from "chai";
import { network } from "hardhat";
import { it } from "node:test";


const decimals = BigInt(10**18)
const totalSupply = decimals * BigInt(1000);
const value = BigInt(5)*decimals;

const { ethers } = await network.connect();

describe('First Token', function(){
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
    
        const Token = await ethers.deployContract("FoxGhostToken");
        //await ethers.constructor();
        await Token.mint(owner, totalSupply);

        // Fixtures can return anything you consider useful for your tests
        return { Token, owner, addr1, addr2 };
      }

    it('Test Name', async function(){
        const { networkHelpers } = await network.connect();
        const { Token } = await networkHelpers.loadFixture(deployTokenFixture);
        expect(await Token.name()).to.equal('FoxGhostToken');
    });

    it('Test Simbol', async function(){
        const { Token } = await loadFixture(deployTokenFixture);
        expect(await Token.symbol()).to.equal('FGT');
    });

    it('Test Decimals', async function(){
        const { Token } = await loadFixture(deployTokenFixture);
        expect(await Token.decimals()).to.equal(18);
    });

    it('Total Supply', async function(){
        const { Token } = await loadFixture(deployTokenFixture);
        expect(await Token.totalSupply()).to.equal(totalSupply);
    });


    it('Test Mint: Balance of the deployer', async function(){
        const { Token, owner } = await loadFixture(deployTokenFixture);
        expect(await Token.balanceOf(owner)).to.equal(totalSupply);
    });

    it('Test Mint: Mint to a user', async function(){
        const { Token, owner, addr1 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).mint(addr1, value);

        expect(await Token.balanceOf(addr1)).to.equal(value);
    });

    it('Test Transfer: Owner pays user', async function(){
        const { Token, owner, addr1 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).transfer(addr1, value);
        expect(await Token.balanceOf(addr1)).to.equal(value);
    });

    it('Test Transfer: User pays user', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).transfer(addr1, value);
        await Token.connect(addr1).transfer(addr2, value);
        expect(await Token.balanceOf(addr2)).to.equal(value);
    });

    it('Test Burn', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).transfer(addr1, value);
        await Token.connect(addr1).burn(value);
        await expect(await Token.balanceOf(addr1)).to.equal(BigInt(0));
    });

    it('Test Approve: spend all in one', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).approve(addr1, value);
        await Token.connect(addr1).transferFrom(owner, addr2, value);
        expect(await Token.balanceOf(addr2)).to.equal(value);
    });

    it('Test Approve: spend all in many', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).approve(addr1, value);

        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);

        expect(await Token.balanceOf(addr2)).to.equal(value);
    });

    it('Test Approve: spend not all', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).approve(addr1, value);

        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);

        expect(await Token.balanceOf(addr2)).to.equal(BigInt(3)*decimals);
    });

    it('Test Approve: spend more than allowed', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).approve(addr1, value);
        
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);
        await Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals);

        await expect(Token.connect(addr1).transferFrom(owner, addr2, BigInt(1) * decimals)).to.be.revertedWith('ERC20: insufficient allowance');

    });
    
    it('Test Approve: Burn', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).transfer(addr1, value);
        await Token.connect(addr1).approve(owner, value);
        await Token.connect(owner).burnFrom(addr1, value);
        await expect(await Token.balanceOf(addr1)).to.equal(BigInt(0));
    });

    it('Test Allowance', async function(){
        const { Token, owner, addr1 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).approve(addr1, value);

        expect(await Token.allowance(owner, addr1)).to.equal(value);
    });

    it('Test 0 address: transfer', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        
        await expect(Token.connect(owner).transfer('0x0000000000000000000000000000000000000000', value)).to.be.revertedWith('ERC20: transfer to the zero address');
    });

    it('Test 0 address: transferFrom: to', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await Token.connect(owner).approve(addr1, value);

        await expect(Token.connect(addr1).transferFrom(owner, '0x0000000000000000000000000000000000000000', value)).to.be.revertedWith('ERC20: transfer to the zero address');
    });

    it('Test 0 address: approve: from', async function(){
        const { Token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        await expect(Token.connect(owner).approve('0x0000000000000000000000000000000000000000', value)).to.be.revertedWith('ERC20: approve to the zero address');

        //await expect(Token.connect('0x0000000000000000000000000000000000000000').transferFrom('0x0000000000000000000000000000000000000000', owner, value).to.be.revertedWith(''));
    });

    it('Test Events: Transfer', async function(){
        const { Token, addr1 } = await loadFixture(deployTokenFixture);
        await expect(Token.transfer(addr1, value)).to.emit(Token, 'Transfer');
    });

    it('Test Events: Approval', async function(){
        const { Token, addr1 } = await loadFixture(deployTokenFixture);
        await expect(Token.approve(addr1, value)).to.emit(Token, 'Approval');
    });
    
});
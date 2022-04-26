import { expect, assert } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const shouldDeposit = (): void => {
  //   // to silent warning for duplicate definition of Transfer event
  //   ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

  context(`#deposit`, async function () {
    it(`should revert if token amount is not greater than 0`, async function () { // testing passing amount 0 on 'Lending.sol' deposit function (should revert)
      const amount = ethers.constants.Zero;

      await expect(this.lending.connect(this.signers.alice).deposit(this.mocks.mockUsdc.address, amount)).to.be.revertedWith('NeedsMoreThanZero');
    });

    // other test: emit event properly
    it('should emit proper event', async function () {
      const amount: BigNumber = ethers.constants.One;

      await expect(this.lending.connect(this.signers.alice).deposit(this.mocks.mockUsdc.address, amount)).to.emit(this.lending,'Deposit').withArgs(this.signers.alice.address, this.mocks.mockUsdc.address, amount);
    });

    // test: check if mapping amount is updated correctly
    it('should update storage variable properly', async function () {
      // for storage we are using 'expect' instead of 'expect'
      const previousAccountToTokenDeposits: BigNumber = await this.lending.s_accountToTokenDeposits(this.signers.alice.address, this.mocks.mockUsdc.address);
      
      console.log(previousAccountToTokenDeposits); // previous balance (before deposit)
      
      const amount: BigNumber = parseEther('1'); // 1 ether
      await this.lending.connect(this.signers.alice).deposit(this.mocks.mockUsdc.address, amount);
      const currentAccountToTokenDeposits: BigNumber = await this.lending.s_accountToTokenDeposits(this.signers.alice.address, this.mocks.mockUsdc.address);
      console.log(currentAccountToTokenDeposits); // updated balance (after deposit)

      // assert function from CHAI (assert function does not handle BigNumber -> we need to cast with .toBigInt())
      assert(currentAccountToTokenDeposits.toBigInt() === previousAccountToTokenDeposits.add(amount).toBigInt(),'New value should equal previous + amount') // 3 '=' means that is going to compare type also
    });

  });
};

const SwapzillaCore = artifacts.require("SwapzillaCore");
let SwapzillaCore_instance;
let weth, comp, bat;
const wethAPI = require("./daiAbi.json");
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const account = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const compAddress = "0xc00e94cb662c3520282e6f5717214004a7f26888";
const batAddress = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF";
const chainAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
const manaAddress = "0x0f5d2fb29fb7d3cfee444a200298f468908cc942";
const ampAddress = "0xff20817765cb7f73d4bde2e66e067e58d11095c2";

const allowance_amount = web3.utils.toWei("10000000000000", "ether");

const toWei = (amount) => {
  return web3.utils.toWei(amount.toString(), "ether");
};
contract("", () => {
  beforeEach(async () => {
    weth = new web3.eth.Contract(wethAPI, wethAddress);
    comp = new web3.eth.Contract(wethAPI, compAddress);
    bat = new web3.eth.Contract(wethAPI, batAddress);
    chain = new web3.eth.Contract(wethAPI, chainAddress);
    mana = new web3.eth.Contract(wethAPI, manaAddress);
    amp = new web3.eth.Contract(wethAPI, ampAddress);

    SwapzillaCore_instance = await SwapzillaCore.new([wethAddress]);
  });

  it("BulkSwap", async () => {
    await weth.methods
      .approve(SwapzillaCore_instance.address, allowance_amount)
      .send({ from: account });
    const tx1 = await SwapzillaCore_instance.bulkSwapERC20(
      wethAddress,
      [compAddress, batAddress, chainAddress, manaAddress, ampAddress],
      [toWei(10), toWei(10), toWei(10), toWei(10), toWei(10)],
      [toWei("100"), toWei("100"), toWei("100"), toWei("100"), toWei("100")],
      toWei("600"),
      3000,
      { from: account }
    );
    const tx2 = await SwapzillaCore_instance.bulkSwapERC20(
      wethAddress,
      [compAddress, batAddress, chainAddress, manaAddress, ampAddress],
      [toWei(10), toWei(10), toWei(10), toWei(10), toWei(10)],
      [toWei("100"), toWei("100"), toWei("100"), toWei("100"), toWei("100")],
      toWei("500"),
      3000,
      { from: account }
    );

    const tx3 = await SwapzillaCore_instance.bulkSwapERC20(
      wethAddress,
      [compAddress, batAddress, chainAddress, manaAddress, ampAddress],
      [toWei(10), toWei(10), toWei(10), toWei(10), toWei(10)],
      [toWei("100"), toWei("100"), toWei("100"), toWei("100"), toWei("100")],
      toWei("600"),
      3000,
      { from: account }
    );
    /*     const acct_bat1 = await bat.methods.balanceOf(account).call();
    const acct_comp1 = await comp.methods.balanceOf(account).call();
    const acct_weth1 = await weth.methods.balanceOf(account).call();
    console.log(
      `bat balance: ${acct_bat1} comp balance: ${acct_comp1} balance weth: ${acct_weth1}`
    ); */
    console.log("Gas used Tx1", tx1.receipt.gasUsed / 5);
    console.log("Gas used Tx2", tx2.receipt.gasUsed / 5);
    console.log("Gas used Tx3", tx3.receipt.gasUsed / 5);
  });
});

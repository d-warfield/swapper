//const SwapzillaCore = artifacts.require("SwapzillaCore");
let swapzilla;
let weth, comp, bat;
const wethAPI = require("./daiAbi.json");
const swapzillaAbi = require("./swapzillaAbi.json");

const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const account = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const compAddress = "0xc00e94cb662c3520282e6f5717214004a7f26888";
const batAddress = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF";
const chainAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
const manaAddress = "0x0f5d2fb29fb7d3cfee444a200298f468908cc942";
const ampAddress = "0xff20817765cb7f73d4bde2e66e067e58d11095c2";
const swapzillaAddress = "0x1dfBC92734eafA53D09eE9177c8616974E345Afc";

const allowance_amount = web3.utils.toWei("10000000000000000", "ether");

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

    swapzilla = new web3.eth.Contract(swapzillaAbi, swapzillaAddress);
  });

  it("BulkSwap", async () => {
    const acct_bat1 = await bat.methods.balanceOf(account).call();
    const acct_comp1 = await comp.methods.balanceOf(account).call();
    const acct_weth1 = await weth.methods.balanceOf(account).call();
    // console.log(
    //   `bat balance: ${acct_bat1} comp balance: ${acct_comp1} balance weth: ${acct_weth1}`
    // );
    console.log(`BEFORE BAT BALANCE : ${acct_bat1} `);

    console.log(
      "SWAPZILLA ---> WETH IS APPROVED BY SWAPZILLLA",
      await swapzilla.methods.whitelisted(wethAddress).call()
    );
    console.log(
      "SWAPZILLA ---> SWAP ROUTER ADDRESS:",
      await swapzilla.methods.swapRouter().call()
    );

    await weth.methods
      .approve(
        swapzillaAddress,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      )
      .send({ from: account });

    console.log(
      "WETH ---> SENDER APPROVED SWAPZILLA TO HANDLE WETH",
      await weth.methods.allowance(account, swapzillaAddress).call()
    );

    console.log(
      "WETH ---> SENDER WETH BALANCE",
      await weth.methods.balanceOf(account).call()
    );

    console.log(
      "WETH ---> SWAPZILLA APPROVED UNIROUTER TO HANDLE WETH",
      await weth.methods
        .allowance(
          swapzillaAddress,
          "0xE592427A0AEce92De3Edee1F18E0157C05861564"
        )
        .call()
    );

    // hard-coded bat in amount and weth amountInMax
    const tx1 = await swapzilla.methods
      .bulkSwapERC20(
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        ["0x0d8775f648430679a709e98d2b0cb6250d2887ef"],
        ["1000000000000000000"],
        ["300000000000000"],
        "300000000000000",
        3000
      )
      .send({ from: account ,gas:'3100000'}); // ELB update it by adding gas flag here

    const acct_bat2 = await bat.methods.balanceOf(account).call();

    console.log(`AFTER BAT BALANCE: ${acct_bat2}`);
    console.log("Gas used Tx1", tx1.gasUsed); // ELB updated from tx1.receipt.gasUsed to tx1.gasUsed
  });
});

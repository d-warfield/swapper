// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.10;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapzillaCore is Ownable {
    ISwapRouter public immutable swapRouter;
    mapping(address => bool) public whitelisted;

    constructor(address[] memory tokenIn) {
        swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
        for (uint256 i = 0; i < tokenIn.length; i++) {
            whitelisted[tokenIn[i]] = true;
            safeApproveRouter(tokenIn[i]);
        }
    }

    function bulkSwapERC20(
        address tokenIn,
        address[] calldata tokensOut,
        uint256[] calldata amountsOut,
        uint256[] calldata amountsInMaximum,
        uint256 totalAmountInMaximum,
        uint256 poolFee
    ) external {
        require(whitelisted[tokenIn], "This token is not approved");
        uint256 length = tokensOut.length;
        TransferHelper.safeTransferFrom(
            tokenIn,
            msg.sender,
            address(this),
            totalAmountInMaximum
        );
        uint256 amountIn;
        for (uint256 i = 0; i < length; i++) {
            amountIn += swapExactOutputSingle(
                tokenIn,
                tokensOut[i],
                amountsOut[i],
                amountsInMaximum[i],
                poolFee
            );
        }
        require(amountIn <= totalAmountInMaximum, "Spent");
        if (amountIn < totalAmountInMaximum) {
            TransferHelper.safeTransfer(
                tokenIn,
                msg.sender,
                totalAmountInMaximum - amountIn
            );
        }
    }

    /// @notice swapExactOutputSingle swaps a minimum possible amount of TOKEN_IN for a fixed amount of TOKEN_OUT.
    /// @dev The calling address must approve this contract to spend its TOKEN_IN for this function to succeed. As the amount of input TOKEN_IN is variable,
    /// the calling address will need to approve for a slightly higher amount, anticipating some variance.
    /// @param amountOut The exact amount of TOKEN_OUT to receive from the swap.
    /// @param amountInMaximum The amount of TOKEN_IN we are willing to spend to receive the specified amount of TOKEN_OUT.
    /// @return amountIn The amount of TOKEN_IN actually spent in the swap.

    function swapExactOutputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountOut,
        uint256 amountInMaximum,
        uint256 poolFee
    ) internal returns (uint256 amountIn) {
        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: uint24(poolFee),
                recipient: msg.sender,
                deadline: block.timestamp,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = swapRouter.exactOutputSingle(params);
    }

    function safeApproveRouter(address tokenIn) public onlyOwner {
        TransferHelper.safeApprove(
            tokenIn,
            address(swapRouter),
            type(uint256).max
        );
    }

    function updateWhitelistTokenIn(address tokenIn, bool isWhitelisted)
        public
        onlyOwner
    {
        whitelisted[tokenIn] = isWhitelisted;
    }

    function rescueTokens(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) public onlyOwner {
        IERC20(tokenAddress).transfer(recipient, amount);
    }
}

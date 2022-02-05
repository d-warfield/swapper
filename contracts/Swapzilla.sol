// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.10;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract SwapzillaCore {
    ISwapRouter public immutable swapRouter;

    constructor() {
        swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    }

    function bulkSwapERC20(
        address tokenIn,
        address[] calldata tokensOut,
        uint256[] calldata amountsOut,
        uint256[] calldata amountsInMaximum,
        uint24[] calldata poolFee
    ) external {
        uint256 length = tokensOut.length;

        for (uint256 i = 0; i < length; i++) {
            swapExactOutputSingle(
                tokenIn,
                tokensOut[i],
                amountsOut[i],
                amountsInMaximum[i],
                poolFee[i]
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
        uint24 poolFee
    ) internal returns (uint256 amountIn) {
        // Transfer the specified amount of TOKEN_IN to this contract.
        TransferHelper.safeTransferFrom(
            tokenIn,
            msg.sender,
            address(this),
            amountInMaximum
        );

        // Approve the router to spend the specifed `amountInMaximum` of TOKEN_IN.
        // In production, you should choose the maximum amount to spend based on oracles or other data sources to acheive a better swap.
        TransferHelper.safeApprove(
            tokenIn,
            address(swapRouter),
            amountInMaximum
        );

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = swapRouter.exactOutputSingle(params);

        // For exact output swaps, the amountInMaximum may not have all been spent.
        // If the actual amount spent (amountIn) is less than the specified maximum amount, we must refund the msg.sender and approve the swapRouter to spend 0.
        if (amountIn < amountInMaximum) {
            TransferHelper.safeApprove(tokenIn, address(swapRouter), 0);
            TransferHelper.safeTransfer(
                tokenIn,
                msg.sender,
                amountInMaximum - amountIn
            );
        }
    }
}

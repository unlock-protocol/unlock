// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract TestERC721Recevier {
    function onERC721Received(
        address, 
        address, 
        uint256, 
        bytes calldata
    ) external returns(bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    } 
}
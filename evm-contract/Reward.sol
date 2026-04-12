// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Reward {
    mapping(address => uint256) public rewards;

    event RewardClaimed(address user, uint256 amount);

    function setReward(address user, uint256 amount) external {
        rewards[user] += amount;
    }

    function claimReward() external {
        uint256 amount = rewards[msg.sender];
        require(amount > 0, "No reward");

        rewards[msg.sender] = 0;

        emit RewardClaimed(msg.sender, amount);
    }

    function getReward(address user) external view returns (uint256) {
        return rewards[user];
    }
}
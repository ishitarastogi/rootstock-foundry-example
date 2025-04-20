// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TapToRoot {
    uint256 public totalRoots;
    mapping(address => uint256) public rootsByUser;
    mapping(address => uint256) public rootsReceived;

    event SelfRooted(
        address indexed user,
        uint256 userTotal,
        uint256 globalTotal
    );
    event FriendRooted(
        address indexed from,
        address indexed to,
        uint256 totalSentBySender,
        uint256 totalReceivedByFriend,
        uint256 globalTotal
    );

    function root() external {
        rootsByUser[msg.sender] += 1;
        totalRoots += 1;
        emit SelfRooted(msg.sender, rootsByUser[msg.sender], totalRoots);
    }

    function rootFriend(address friend) external {
        require(friend != msg.sender, "Can't root yourself here");
        rootsByUser[msg.sender] += 1;
        rootsReceived[friend] += 1;
        totalRoots += 1;
        emit FriendRooted(
            msg.sender,
            friend,
            rootsByUser[msg.sender],
            rootsReceived[friend],
            totalRoots
        );
    }

    function getRootsReceived(address user) external view returns (uint256) {
        return rootsReceived[user];
    }

    function getRootsMade(address user) external view returns (uint256) {
        return rootsByUser[user];
    }
}

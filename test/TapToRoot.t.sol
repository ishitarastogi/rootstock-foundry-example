// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TapToRoot.sol";

contract TapToRootTest is Test {
    TapToRoot tap;
    address alice = address(0xA1CE);
    address bob = address(0xB0B);

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

    function setUp() public {
        tap = new TapToRoot();
    }

    function testInitialCountsAreZero() public {
        assertEq(tap.totalRoots(), 0);
        assertEq(tap.getRootsMade(alice), 0);
        assertEq(tap.getRootsReceived(alice), 0);
    }

    function testSelfRootEmitsEventAndIncrements() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit SelfRooted(alice, 1, 1);
        tap.root();

        assertEq(tap.totalRoots(), 1);
        assertEq(tap.getRootsMade(alice), 1);
        assertEq(tap.getRootsReceived(alice), 0);
    }

    function testMultipleSelfRoots() public {
        vm.prank(alice);
        tap.root();
        vm.prank(alice);
        tap.root();

        assertEq(tap.totalRoots(), 2);
        assertEq(tap.getRootsMade(alice), 2);
    }

    function testFriendRootEmitsEventAndIncrements() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit FriendRooted(alice, bob, 1, 1, 1);
        tap.rootFriend(bob);

        assertEq(tap.totalRoots(), 1);
        assertEq(tap.getRootsMade(alice), 1);
        assertEq(tap.getRootsReceived(bob), 1);

        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit FriendRooted(alice, bob, 2, 2, 2);
        tap.rootFriend(bob);

        assertEq(tap.totalRoots(), 2);
        assertEq(tap.getRootsMade(alice), 2);
        assertEq(tap.getRootsReceived(bob), 2);
    }

    function testRootFriendRevertOnSelf() public {
        vm.prank(alice);
        vm.expectRevert("Can't root yourself here");
        tap.rootFriend(alice);
    }

    function testMixSelfAndFriendRoots() public {
        vm.prank(alice);
        tap.root();

        vm.prank(bob);
        tap.root();
        vm.prank(bob);
        tap.root();

        vm.prank(alice);
        tap.rootFriend(bob);

        assertEq(tap.totalRoots(), 4);
        assertEq(tap.getRootsMade(alice), 2);
        assertEq(tap.getRootsMade(bob), 2);
        assertEq(tap.getRootsReceived(bob), 1);
        assertEq(tap.getRootsReceived(alice), 0);
    }
}

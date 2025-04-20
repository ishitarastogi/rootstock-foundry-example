import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xbb6ca48854b32d43f67f78670258ee3444ea3b31"; // replace
const ABI = [
  "function root() external",
  "function rootFriend(address friend) external",
  "function getRootsMade(address user) external view returns (uint256)",
  "function getRootsReceived(address user) external view returns (uint256)",
  "event SelfRooted(address indexed user, uint256 userTotal, uint256 globalTotal)",
  "event FriendRooted(address indexed from, address indexed to, uint256 totalSentBySender, uint256 totalReceivedByFriend, uint256 globalTotal)",
];

export default function TapToRootApp() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [userAddress, setUserAddress] = useState("");
  const [myRoots, setMyRoots] = useState(0);
  const [myReceived, setMyReceived] = useState(0);
  const [friendAddress, setFriendAddress] = useState("");

  // Connect wallet
  async function connectWallet() {
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    await prov.send("eth_requestAccounts", []);
    const signer = prov.getSigner();
    const address = await signer.getAddress();

    setProvider(prov);
    setSigner(signer);
    setUserAddress(address);
    setContract(new ethers.Contract(CONTRACT_ADDRESS, ABI, signer));
  }

  // Fetch user data
  async function fetchData() {
    if (!contract || !userAddress) return;
    const made = await contract.getRootsMade(userAddress);
    const received = await contract.getRootsReceived(userAddress);
    setMyRoots(made.toNumber());
    setMyReceived(received.toNumber());
  }

  useEffect(() => {
    fetchData();
  }, [contract, userAddress]);

  const tapRoot = async () => {
    const tx = await contract.root();
    await tx.wait();
    fetchData();
  };

  const tapFriend = async () => {
    if (!ethers.utils.isAddress(friendAddress)) {
      alert("Invalid address");
      return;
    }
    const tx = await contract.rootFriend(friendAddress);
    await tx.wait();
    fetchData();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>🌱 TapToRoot on Rootstock</h2>
      {!userAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>👤 Your Address: {userAddress}</p>
          <p>🌱 You’ve rooted {myRoots} times</p>
          <p>🤝 You’ve been rooted by others {myReceived} times</p>

          <button onClick={tapRoot}>🌱 Tap Root</button>

          <div style={{ marginTop: "1rem" }}>
            <input
              placeholder="Friend address"
              value={friendAddress}
              onChange={(e) => setFriendAddress(e.target.value)}
              style={{ width: "300px" }}
            />
            <button onClick={tapFriend}>👯 Tap Friend</button>
          </div>
        </>
      )}
    </div>
  );
}

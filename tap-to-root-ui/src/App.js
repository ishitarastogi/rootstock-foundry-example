import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "0xbb6ca48854b32d43f67f78670258ee3444ea3b31";
const ABI = [
  "function root() external",
  "function rootFriend(address friend) external",
  "function getRootsMade(address user) external view returns (uint256)",
  "function getRootsReceived(address user) external view returns (uint256)",
  "event SelfRooted(address indexed user, uint256 userTotal, uint256 globalTotal)",
  "event FriendRooted(address indexed from, address indexed to, uint256 totalSentBySender, uint256 totalReceivedByFriend, uint256 globalTotal)",
];

export default function App() {
  const [user, setUser] = useState("");
  const [contract, setContract] = useState(null);
  const [roots, setRoots] = useState({ made: 0, received: 0 });
  const [friend, setFriend] = useState("");
  const [popupMsg, setPopupMsg] = useState("");

  // Connect wallet
  async function connect() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    setUser(addr);
    setContract(new ethers.Contract(CONTRACT_ADDRESS, ABI, signer));
  }

  // Fetch stats inside a proper useEffect
  useEffect(() => {
    if (!contract || !user) return;

    // define and invoke async fetch
    (async () => {
      try {
        const [made, received] = await Promise.all([
          contract.getRootsMade(user),
          contract.getRootsReceived(user),
        ]);
        setRoots({
          made: made.toNumber(),
          received: received.toNumber(),
        });
      } catch (err) {
        console.error("fetchStats failed", err);
      }
    })();
  }, [contract, user]);

  // show popup
  function showPopup(text) {
    setPopupMsg(text);
    setTimeout(() => setPopupMsg(""), 2000);
  }

  const doRoot = async () => {
    const tx = await contract.root();
    await tx.wait();
    showPopup("You rooted 🌱");
    // re-fetch
    const made = await contract.getRootsMade(user);
    const received = await contract.getRootsReceived(user);
    setRoots({ made: made.toNumber(), received: received.toNumber() });
  };

  const doRootFriend = async () => {
    if (!ethers.utils.isAddress(friend)) {
      return showPopup("Invalid friend address");
    }
    const tx = await contract.rootFriend(friend);
    await tx.wait();
    showPopup("Friend rooted 👯");
    // re-fetch
    const made = await contract.getRootsMade(user);
    const received = await contract.getRootsReceived(user);
    setRoots({ made: made.toNumber(), received: received.toNumber() });
  };

  return (
    <div className="app-container">
      <div className="card">
        {popupMsg && <div className="popup">{popupMsg}</div>}

        {!user ? (
          <button onClick={connect} className="tap-button">
            🔌
          </button>
        ) : (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat-value">{roots.made}</div>
                <div className="stat-label">Your Roots</div>
              </div>
              <div className="stat">
                <div className="stat-value">{roots.received}</div>
                <div className="stat-label">Roots Received</div>
              </div>
            </div>
            <h1 className="title">Tap (to) Root 🌱</h1>

            <button onClick={doRoot} className="tap-button">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3239/3239326.png"
                alt="Tap Root"
                style={{ width: "40px", height: "40px" }}
              />
            </button>

            <div className="input-group">
              <input
                type="text"
                placeholder="Friend address"
                value={friend}
                onChange={(e) => setFriend(e.target.value)}
                className="input"
              />
              <button onClick={doRootFriend} className="button-friend">
                👯
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

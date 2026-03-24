const { ethers } = require("ethers");
require("dotenv").config();

try {
    const pk = process.env.PRIVATE_KEY;
    console.log("PK length:", pk ? pk.length : "undefined");
    console.log("PK starts with 0x:", pk ? pk.startsWith("0x") : "n/a");
    const wallet = new ethers.Wallet(pk);
    console.log("Address:", wallet.address);
} catch (e) {
    console.error("Error:", e.message);
}

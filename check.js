const fetch = require("node-fetch");

const USER_ID = process.env.ROBLOX_USER_ID;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

async function checkStatus() {
    const res = await fetch("https://presence.roblox.com/v1/presence/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [USER_ID] })
    });

    const data = await res.json();
    const presence = data.userPresences[0].userPresenceType;

    if (presence !== 0) {
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: "User is ONLINE!" })
        });
        console.log("Sent Discord message");
    } else {
        console.log("User offline");
    }
}

checkStatus();

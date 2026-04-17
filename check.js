const fetch = require("node-fetch");
const fs = require("fs");

const users = [
  { id: process.env.ROBLOX_USER_1, name: "User 1" },
  { id: process.env.ROBLOX_USER_2, name: "User 2" }
];

const webhook = process.env.DISCORD_WEBHOOK;

// Load previous state
let state = {};
if (fs.existsSync("state.json")) {
  state = JSON.parse(fs.readFileSync("state.json"));
}

async function getPresence(userId) {
  const res = await fetch(`https://presence.roblox.com/v1/presence/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds: [userId] })
  });

  const data = await res.json();
  return data.userPresences[0].userPresenceType === 2 ? "online" : "offline";
}

async function sendDiscord(msg) {
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: msg })
  });
}

(async () => {
  for (const user of users) {
    const currentStatus = await getPresence(user.id);
    const prev = state[user.id] || {
      status: "offline",
      lastChange: Date.now(),
      uptimeMinutes: 0
    };

    // If status changed
    if (currentStatus !== prev.status) {
      const now = Date.now();
      const minutes = Math.floor((now - prev.lastChange) / 60000);

      if (currentStatus === "online") {
        await sendDiscord(`${user.name} is now ONLINE (was offline for ${minutes} minutes)`);
      } else {
        await sendDiscord(`${user.name} went OFFLINE after being online for ${minutes} minutes`);
      }

      // Update state
      state[user.id] = {
        status: currentStatus,
        lastChange: now,
        uptimeMinutes: minutes
      };
    } else {
      // No change → update uptime counter
      const now = Date.now();
      const minutes = Math.floor((now - prev.lastChange) / 60000);

      state[user.id] = {
        status: currentStatus,
        lastChange: prev.lastChange,
        uptimeMinutes: minutes
      };
    }
  }

  fs.writeFileSync("state.json", JSON.stringify(state));
})();

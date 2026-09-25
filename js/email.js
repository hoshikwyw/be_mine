// Sends her answer to your inbox via Web3Forms (https://web3forms.com).
// Setup: create a free access key for khaingwutyiwin1712@gmail.com and paste it below.
// The key is fine to be public: it can only send mail TO your address.
import { email as C } from "./content.js";

export const ACCESS_KEY = "04a2d93d-c711-48d3-9cfc-3e1366e788fe";

export async function sendAnswer({ answer, message = "", cleared, skipped, startedAt }) {
  const body = {
    access_key: ACCESS_KEY,
    subject: `${C.subjectPrefix}: ${String(answer).toUpperCase()}`,
    from_name: "Proposal site",
    answer: String(answer),
    message: message && message.trim() ? message.trim() : "(no message)",
    levels_cleared: String(cleared),
    levels_skipped: (skipped && skipped.length) ? skipped.join(", ") : "none",
    started_at: String(startedAt || "-"),
    answered_at: new Date().toString(),
  };
  const attempt = () =>
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))));

  try {
    return await attempt();
  } catch {
    await new Promise((r) => setTimeout(r, 2500)); // one quiet retry
    try {
      return await attempt();
    } catch {
      return { success: false }; // caller shows the "screenshot this" fallback
    }
  }
}

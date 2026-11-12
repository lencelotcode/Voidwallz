import { readFile, writeFile, chmod } from "node:fs/promises";
import { hashPassword } from "../server/adminSession";

if (process.argv.includes("--help")) {
  console.log("Run npm run security:setup in your own terminal. It reads a new studio password without echoing it and saves only its hash plus fresh session/logging secrets in .env.local.");
} else {
  if (!process.stdin.isTTY) throw new Error("Run this command in an interactive terminal. Do not pass passwords as command-line arguments.");
  function hiddenInput(prompt: string): Promise<string> {
    process.stdout.write(prompt); process.stdin.setRawMode(true); process.stdin.resume();
    return new Promise((resolve, reject) => {
      let value = "";
      const finish = (error?: Error) => {
        process.stdin.off("data", onData); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n");
        if (error) reject(error); else resolve(value);
      };
      function onData(data: Buffer) {
        for (const char of data.toString("utf8")) {
          if (char === "\u0003") return finish(new Error("Cancelled."));
          if (char === "\r" || char === "\n") return finish();
          if (char === "\u007f" || char === "\b") value = value.slice(0,-1);
          else if (char >= " " && value.length < 256) value += char;
        }
      }
      process.stdin.on("data", onData);
    });
  }
  const password = await hiddenInput("New unique studio password (16–256 characters): ");
  const confirmation = await hiddenInput("Repeat password: ");
  if (password !== confirmation) throw new Error("Passwords do not match. No settings changed.");
  const hash = await hashPassword(password);
  const random = () => Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  const values = { ADMIN_PASSWORD_HASH: hash, ADMIN_SESSION_SECRET: random(), SECURITY_LOG_SALT: random() };
  const path = new URL("../.env.local", import.meta.url);
  let previous = await readFile(path,"utf8").catch(() => "");
  previous = previous.split("\n").filter(line => !/^(ADMIN_PASSWORD_HASH|ADMIN_SESSION_SECRET|SECURITY_LOG_SALT|VITE_ADMIN_PASSKEY)=/.test(line)).join("\n").trimEnd();
  // This format avoids dotenv variable interpolation in password hashes.
  await writeFile(path, `${previous}\n${Object.entries(values).map(([key,value]) => `${key}='${value}'`).join("\n")}\n`, { mode: 0o600 });
  await chmod(path,0o600);
  console.log("Saved hashed studio credentials and fresh session/logging secrets in .env.local. Configure the same server-only values in your hosting settings, plus the database service key. The password was not saved or printed.");
}

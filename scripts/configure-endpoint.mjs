import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.join(root, "plugins", "extract-skills");
const configPath = path.join(root, "config", "endpoint.json");
const requested = process.argv[2];

if (requested) {
  let parsed;
  try {
    parsed = new URL(requested);
  } catch {
    throw new Error("Endpoint must be an absolute URL.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Endpoint must use HTTPS.");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Endpoint must not contain credentials, a query, or a fragment.");
  }
  await writeFile(configPath, `${JSON.stringify({ mcpEndpoint: parsed.href }, null, 2)}\n`);
}

const { mcpEndpoint } = JSON.parse(await readFile(configPath, "utf8"));
const endpoint = new URL(mcpEndpoint);
if (endpoint.protocol !== "https:") {
  throw new Error("config/endpoint.json must contain an HTTPS endpoint.");
}

const claudeConfig = {
  mcpServers: {
    "skills-atlas": {
      type: "http",
      url: mcpEndpoint,
    },
  },
};
const codexConfig = {
  "skills-atlas": {
    url: mcpEndpoint,
  },
};
const cursorConfig = {
  mcpServers: {
    "skills-atlas": {
      url: mcpEndpoint,
    },
  },
};

await Promise.all([
  writeFile(path.join(pluginRoot, ".mcp.json"), `${JSON.stringify(claudeConfig, null, 2)}\n`),
  writeFile(path.join(pluginRoot, "mcp.json"), `${JSON.stringify(cursorConfig, null, 2)}\n`),
  writeFile(
    path.join(pluginRoot, "mcp", "codex.json"),
    `${JSON.stringify(codexConfig, null, 2)}\n`,
  ),
]);

const openaiPath = path.join(pluginRoot, "skills", "import-skills", "agents", "openai.yaml");
const openai = await readFile(openaiPath, "utf8");
const nextOpenai = openai.replace(
  /^(\s+url:\s+).*$/m,
  `$1"${mcpEndpoint.replaceAll('"', '\\"')}"`,
);
if (nextOpenai === openai && !openai.includes(`url: "${mcpEndpoint}"`)) {
  throw new Error("Could not update the MCP dependency URL in agents/openai.yaml.");
}
await writeFile(openaiPath, nextOpenai);

console.log(`Configured Skills Atlas MCP endpoint: ${mcpEndpoint}`);

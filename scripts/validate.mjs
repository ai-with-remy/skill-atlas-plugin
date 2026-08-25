import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = "plugins/extract-skills";
const errors = [];

const required = [
  ".claude-plugin/marketplace.json",
  ".cursor-plugin/marketplace.json",
  ".agents/plugins/marketplace.json",
  "config/endpoint.json",
  `${pluginRoot}/.claude-plugin/plugin.json`,
  `${pluginRoot}/.codex-plugin/plugin.json`,
  `${pluginRoot}/.cursor-plugin/plugin.json`,
  `${pluginRoot}/.mcp.json`,
  `${pluginRoot}/mcp.json`,
  `${pluginRoot}/mcp/codex.json`,
  `${pluginRoot}/skills/import-skills/SKILL.md`,
  `${pluginRoot}/skills/import-skills/references/classification.md`,
  `${pluginRoot}/skills/import-skills/references/local-paths.md`,
  `${pluginRoot}/skills/import-skills/references/mcp-workflow.md`,
  `${pluginRoot}/skills/import-skills/agents/openai.yaml`,
  `${pluginRoot}/skills/install-plugins/SKILL.md`,
  `${pluginRoot}/skills/install-plugins/references/mcp-workflow.md`,
];

for (const relative of required) {
  try {
    await access(path.join(root, relative));
  } catch {
    errors.push(`Missing required file: ${relative}`);
  }
}

async function json(relative) {
  try {
    return JSON.parse(await readFile(path.join(root, relative), "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${relative}: ${error.message}`);
    return {};
  }
}

const endpointConfig = await json("config/endpoint.json");
const claudeManifest = await json(`${pluginRoot}/.claude-plugin/plugin.json`);
const claudeMarketplace = await json(".claude-plugin/marketplace.json");
const codexManifest = await json(`${pluginRoot}/.codex-plugin/plugin.json`);
const codexMarketplace = await json(".agents/plugins/marketplace.json");
const cursorManifest = await json(`${pluginRoot}/.cursor-plugin/plugin.json`);
const cursorMarketplace = await json(".cursor-plugin/marketplace.json");
const claudeMcp = await json(`${pluginRoot}/.mcp.json`);
const cursorMcp = await json(`${pluginRoot}/mcp.json`);
const codexMcp = await json(`${pluginRoot}/mcp/codex.json`);

let endpoint;
try {
  endpoint = new URL(endpointConfig.mcpEndpoint);
  if (endpoint.protocol !== "https:") errors.push("The MCP endpoint must use HTTPS.");
  if (endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    errors.push("The MCP endpoint must not contain credentials, a query, or a fragment.");
  }
} catch {
  errors.push("config/endpoint.json must contain an absolute mcpEndpoint URL.");
}

for (const [name, manifest] of [
  ["Claude", claudeManifest],
  ["Codex", codexManifest],
  ["Cursor", cursorManifest],
]) {
  if (manifest.name !== "extract-skills") errors.push(`${name} plugin name must be extract-skills.`);
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) {
    errors.push(`${name} version must be semantic x.y.z.`);
  }
  if (manifest.skills !== "./skills/") errors.push(`${name} manifest must use shared ./skills/.`);
}

if (claudeManifest.mcpServers !== "./.mcp.json") {
  errors.push("Claude manifest must reference ./.mcp.json.");
}
if (codexManifest.mcpServers !== "./mcp/codex.json") {
  errors.push("Codex manifest must reference ./mcp/codex.json.");
}
if (cursorManifest.mcpServers !== "./mcp.json") {
  errors.push("Cursor manifest must reference ./mcp.json.");
}
if (claudeMarketplace.name !== "skills-atlas") {
  errors.push("Claude marketplace name must be skills-atlas.");
}
if (claudeMarketplace.owner?.name !== "AI with Remy") {
  errors.push("Claude marketplace owner must be AI with Remy.");
}
if (claudeManifest.displayName !== "Extract Skills") {
  errors.push("Claude plugin displayName must be Extract Skills.");
}
if (claudeMarketplace.plugins?.[0]?.name !== "extract-skills") {
  errors.push("Claude marketplace must list extract-skills first.");
}
if (claudeMarketplace.plugins?.[0]?.source !== "./plugins/extract-skills") {
  errors.push("Claude marketplace must source ./plugins/extract-skills.");
}
if (claudeMarketplace.renames?.["skills-atlas"] !== "extract-skills") {
  errors.push("Claude marketplace must rename skills-atlas to extract-skills.");
}
if (codexMarketplace.plugins?.[0]?.source?.path !== "./plugins/extract-skills") {
  errors.push("Codex marketplace must source ./plugins/extract-skills.");
}
if (cursorMarketplace.plugins?.[0]?.source !== "./plugins/extract-skills") {
  errors.push("Cursor marketplace must source ./plugins/extract-skills.");
}

const configuredEndpoint = endpointConfig.mcpEndpoint;
if (claudeMcp.mcpServers?.["skills-atlas"]?.url !== configuredEndpoint) {
  errors.push(`${pluginRoot}/.mcp.json is out of sync; run npm run configure:endpoint.`);
}
if (codexMcp["skills-atlas"]?.url !== configuredEndpoint) {
  errors.push(`${pluginRoot}/mcp/codex.json is out of sync; run npm run configure:endpoint.`);
}
if (cursorMcp.mcpServers?.["skills-atlas"]?.url !== configuredEndpoint) {
  errors.push(`${pluginRoot}/mcp.json is out of sync; run npm run configure:endpoint.`);
}

if (Object.keys(claudeMcp.mcpServers ?? {}).some((key) => /test 1/i.test(key))) {
  errors.push(".mcp.json must not ship a Test 1 custom connector.");
}
if (Object.keys(claudeMcp.mcpServers ?? {}).join() !== "skills-atlas") {
  errors.push(".mcp.json must expose only the skills-atlas MCP server.");
}
if (!configuredEndpoint.includes("skills.aiwithremy.com")) {
  errors.push("MCP endpoint must be the live Skills Atlas host (skills.aiwithremy.com).");
}
if (/idealize-dev|idealise-dev|atlas\.idealize\.com\.au/i.test(
  JSON.stringify({
    cursorManifest,
    claudeManifest,
    claudeMarketplace,
    configuredEndpoint,
  }),
)) {
  errors.push("Plugin metadata still references idealize-dev or atlas.idealize.com.au.");
}

const skill = await readFile(path.join(root, `${pluginRoot}/skills/import-skills/SKILL.md`), "utf8");
for (const phrase of [
  "list_import_destinations",
  "create_bundle",
  "plan_skill_import",
  "import_skills",
  "The pasted Atlas prompt wins",
  "Do not silently assign General",
]) {
  if (!skill.includes(phrase)) errors.push(`SKILL.md is missing sync contract: ${phrase}`);
}
if (!skill.startsWith("---\n") || !/^name:\s+import-skills$/m.test(skill)) {
  errors.push("SKILL.md must have import-skills YAML frontmatter.");
}
const installSkill = await readFile(
  path.join(root, `${pluginRoot}/skills/install-plugins/SKILL.md`),
  "utf8",
);
if (!installSkill.startsWith("---\n") || !/^name:\s+install-plugins$/m.test(installSkill)) {
  errors.push("install-plugins SKILL.md must have install-plugins YAML frontmatter.");
}
if (!installSkill.includes("list_installable_plugins") || !installSkill.includes("install_plugins")) {
  errors.push("install-plugins SKILL.md must name the MCP install tools.");
}
for (const phrase of [
  "Never execute imported content",
  "explicit `overwrite`, `rename`, or `skip`",
  "Upload complete approved folders",
  "This chat cannot sign in to Skills Atlas",
  "/extract-skills:import-skills",
]) {
  if (!skill.includes(phrase)) errors.push(`SKILL.md is missing safety rule: ${phrase}`);
}
const mcpWorkflow = await readFile(
  path.join(root, `${pluginRoot}/skills/import-skills/references/mcp-workflow.md`),
  "utf8",
);
const deadAuthPhrases = [
  "Extract Skills → Connectors",
  "type `/mcp`",
  "`/mcp`",
  "Skills Atlas Test 1",
];
const readme = await readFile(path.join(root, "README.md"), "utf8");
for (const [label, text] of [
  ["SKILL.md", skill],
  ["mcp-workflow.md", mcpWorkflow],
  ["README.md", readme],
]) {
  for (const phrase of deadAuthPhrases) {
    if (text.includes(phrase)) {
      errors.push(`${label} must not tell users to ${phrase}`);
    }
  }
}

const openai = await readFile(
  path.join(root, `${pluginRoot}/skills/import-skills/agents/openai.yaml`),
  "utf8",
);
if (!openai.includes(`url: "${configuredEndpoint}"`)) {
  errors.push("agents/openai.yaml is out of sync; run npm run configure:endpoint.");
}

const textFiles = [
  `${pluginRoot}/.mcp.json`,
  `${pluginRoot}/mcp/codex.json`,
  `${pluginRoot}/.claude-plugin/plugin.json`,
  `${pluginRoot}/.codex-plugin/plugin.json`,
  ".claude-plugin/marketplace.json",
  ".agents/plugins/marketplace.json",
  `${pluginRoot}/.cursor-plugin/plugin.json`,
  ".cursor-plugin/marketplace.json",
  `${pluginRoot}/mcp.json`,
];
const credentialPattern =
  /("(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)"\s*:\s*")(?!\s*")[^"]+/i;
for (const relative of textFiles) {
  const text = await readFile(path.join(root, relative), "utf8");
  if (credentialPattern.test(text)) errors.push(`Possible embedded credential in ${relative}.`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${required.length} required files and all plugin formats.`);
  console.log(`Canonical MCP endpoint: ${endpoint?.href ?? configuredEndpoint}`);
}

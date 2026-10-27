import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [workflow, readme, packageSource, nodeVersion] = await Promise.all([read("../.github/workflows/pages.yml"), read("../README.md"), read("../package.json"), read("../.nvmrc")]);
const packageJson = JSON.parse(packageSource);
assert.match(workflow, /^on:\s*\n\s+pull_request:\s*\n\s+branches: \[main\]/m, "pull requests targeting main run validation");
assert.match(workflow, /^\s+push:\s*\n\s+branches: \[main\]/m, "pushes to main run validation and deployment");
assert.match(workflow, /^\s+workflow_dispatch:\s*$/m, "manual runs are available");
assert.equal(packageJson.packageManager, `pnpm@${packageJson.engines.pnpm}`, "packageManager and the declared pnpm engine agree");
assert.equal(nodeVersion.trim(), packageJson.engines.node.replace(/\.x$/, ".0"), "the workflow Node version file matches the declared Node line");
assert.match(workflow, /node-version-file: \.nvmrc\s+cache: pnpm\s+cache-dependency-path: pnpm-lock\.yaml/, "setup-node uses the pinned Node version and caches the pnpm lockfile");
assert.match(workflow, /corepack pnpm install --frozen-lockfile/, "the workflow installs from the frozen lockfile");
for (const script of ["verify:domain", "verify:persistence", "build", "verify:pages-build"]) {
  assert.ok(packageJson.scripts[script], `${script} is declared in package metadata`);
  assert.ok(workflow.includes(`corepack pnpm run ${script}`), `${script} is invoked by the workflow`);
  assert.ok(readme.includes(script === "build" ? "corepack pnpm build" : `corepack pnpm run ${script}`), `${script} is documented in README`);
}
assert.equal(packageJson.scripts.build, "tsc --noEmit && vite build", "the workflow's production build includes strict type checking");

const actionPins = [...workflow.matchAll(/^\s+uses: ([\w-]+\/[\w-]+)@([0-9a-f]{40}) # (v[\d.]+)$/gm)];
assert.equal(actionPins.length, 5, "all five third-party actions are pinned to full commit hashes and annotated releases");
for (const [, name, sha] of actionPins) assert.equal(sha.length, 40, `${name} has a full-length pinned revision`);
assert.match(workflow, /uses: actions\/upload-pages-artifact@[0-9a-f]{40} # v5\.0\.0\s+with:\s+path: dist/, "the Pages artifact contains the production build");
assert.match(workflow, /needs: build\s+runs-on: ubuntu-latest/);
assert.match(workflow, /if: github\.event_name != 'pull_request' && github\.ref == 'refs\/heads\/main'/, "only a main push or main manual run can deploy");
assert.match(workflow, /permissions:\s+actions: read\s+contents: read\s+id-token: write\s+pages: write/, "deployment permissions are scoped to the deploy job");
assert.match(workflow, /name: github-pages\s+url: \$\{\{ steps\.deployment\.outputs\.page_url \}\}/, "the deployment URL is attached to its environment");
assert.match(workflow, /group: pages-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/, "pull request runs use separate concurrency groups from production");
const mayDeploy = (event, ref) => event !== "pull_request" && ref === "refs/heads/main";
assert.equal(mayDeploy("pull_request", "refs/pull/12/merge"), false, "pull requests cannot deploy");
assert.equal(mayDeploy("workflow_dispatch", "refs/heads/feature"), false, "manual runs from non-main branches cannot deploy");
assert.equal(mayDeploy("push", "refs/heads/main"), true, "main pushes can deploy after the build dependency succeeds");
assert.ok(readme.includes("GitHub Actions") && readme.includes("main"), "README documents the Pages source transition and publishing branch");

console.log(`Verified Pages triggers, Node ${nodeVersion.trim()}, pnpm ${packageJson.engines.pnpm}, frozen installation, build commands, five SHA-pinned actions, artifact, deploy guard, permissions, environment URL, and isolated PR concurrency.`);

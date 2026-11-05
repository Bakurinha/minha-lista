const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const workflow = fs.readFileSync(
  path.join(__dirname, '../.github/workflows/format-code.yml'),
  'utf8'
);
const step = workflow.split('      - name: Prepare reviewable patch\n')[1];
assert.ok(step, 'workflow patch step must exist');
const block = step.split('        run: |\n')[1].split('      - name:')[0];
const script = block
  .split('\n')
  .filter((line) => !line || line.startsWith('          '))
  .map((line) => line.slice(10))
  .join('\n');

function runPatch(change) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'format patch '));
  const repo = path.join(temp, 'repo');
  fs.mkdirSync(repo);
  const git = (...args) => execFileSync('git', args, { cwd: repo, stdio: 'pipe' });
  try {
    git('init', '-q');
    git('config', 'user.name', 'Workflow test');
    git('config', 'user.email', 'workflow-test@example.invalid');
    fs.writeFileSync(path.join(repo, '.gitignore'), 'node_modules/\n');
    fs.writeFileSync(path.join(repo, 'tracked.js'), 'const value = 1;\n');
    fs.writeFileSync(path.join(repo, 'SECURITY.md'), 'Policy\n');
    fs.mkdirSync(path.join(repo, '.github/workflows'), { recursive: true });
    fs.writeFileSync(path.join(repo, '.github/workflows/ci.yml'), 'name: CI\n');
    git('add', '.');
    git('commit', '-qm', 'fixture');
    fs.mkdirSync(path.join(repo, 'node_modules/example'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'node_modules/example/index.js'), 'ignored\n');
    change(repo);
    const output = path.join(temp, 'output');
    fs.writeFileSync(output, '');
    const result = spawnSync('bash', ['-c', script], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, RUNNER_TEMP: temp, GITHUB_OUTPUT: output },
    });
    assert.equal(result.status, 0, result.stderr);
    return {
      patch: fs.readFileSync(path.join(temp, 'generated.patch'), 'utf8'),
      output: fs.readFileSync(output, 'utf8'),
    };
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

test('ignored installed dependencies do not fail an unchanged formatting run', () => {
  const result = runPatch(() => {});
  assert.equal(result.patch, '');
  assert.equal(result.output, '');
});

test('tracked source changes produce a reviewable patch with installed dependencies', () => {
  const result = runPatch((repo) => {
    fs.writeFileSync(path.join(repo, 'tracked.js'), 'const value = 2;\n');
  });
  assert.match(result.patch, /diff --git a\/tracked\.js b\/tracked\.js/);
  assert.doesNotMatch(result.patch, /node_modules/);
  assert.match(result.output, /^changed=true\n$/);
});

test('workflow, policy and untracked files stay outside the generated patch', () => {
  const result = runPatch((repo) => {
    fs.writeFileSync(path.join(repo, '.github/workflows/ci.yml'), 'name: Changed\n');
    fs.writeFileSync(path.join(repo, 'SECURITY.md'), 'Changed policy\n');
    fs.writeFileSync(path.join(repo, 'untracked.json'), '{}\n');
  });
  assert.equal(result.patch, '');
  assert.equal(result.output, '');
});

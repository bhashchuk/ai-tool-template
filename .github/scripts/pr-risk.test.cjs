const { test } = require('node:test');
const assert = require('node:assert/strict');
const { riskFloor, declaredLevel, diffWasRead, evaluate, syncRiskLabel } = require('./pr-risk.cjs');

const files = (...names) => names.map(filename => ({ filename }));
const ready = body => ({ draft: false, user: { login: 'someone' }, body });

test('auth, deploy and infra paths floor at High', () => {
  for (const path of [
    'supabase/migrations/20261110000000_x.sql',
    'deploy/README.md',
    'backend/app/auth.py',
    'frontend/next.config.ts',
    'vercel.json',
    '.github/workflows/ci.yml',
    '.github/scripts/pr-risk.cjs',
  ]) {
    assert.equal(riskFloor(files(path)).level, 2, path);
  }
});

test('prompt, LLM and eval paths floor at Medium', () => {
  for (const path of [
    'backend/app/prompts/system.md',
    'backend/app/llm.py',
    'backend/app/config.py',
    'evals/cases/example.json',
  ]) {
    assert.equal(riskFloor(files(path)).level, 1, path);
  }
});

test('other paths floor at Low', () => {
  assert.equal(riskFloor(files('frontend/app/page.tsx', 'docs/runbook.md')).level, 0);
});

test('a rename out of a High path still counts as High', () => {
  const floor = riskFloor([{ filename: 'backend/app/old_auth.py', previous_filename: 'backend/app/auth.py' }]);
  assert.equal(floor.level, 2);
  assert.equal(floor.path, 'backend/app/auth.py');
});

test('reads the Level line case-insensitively', () => {
  assert.equal(declaredLevel('## Risk\nlevel: high\nReason: x'), 2);
  assert.equal(declaredLevel('Level:\nReason:'), -1);
});

test('the read-the-diff box must be ticked', () => {
  assert.equal(diffWasRead('- [ ] I read the full diff'), false);
  assert.equal(diffWasRead('- [x] I read the full diff before marking this ready'), true);
});

test('a declared level below the path floor still passes', () => {
  const result = evaluate(ready('Level: Low\n- [x] I read the full diff'), files('backend/app/auth.py'));
  assert.equal(result.error, null);
  assert.equal(result.level, 0);
});

test('a ready PR without the ticked box fails; a draft does not', () => {
  const body = 'Level: Low\n- [ ] I read the full diff';
  assert.match(evaluate(ready(body), files('README.md')).error, /I read the full diff/);
  assert.equal(evaluate({ ...ready(body), draft: true }, files('README.md')).error, null);
});

test('Dependabot needs no Level line and gets the path floor', () => {
  const pr = { draft: false, user: { login: 'dependabot[bot]' }, body: 'Bumps x from 1 to 2.' };
  assert.deepEqual(evaluate(pr, files('frontend/package.json')), { level: 0, error: null });
  assert.deepEqual(evaluate(pr, files('.github/workflows/ci.yml')), { level: 2, error: null });
});

test('creates a missing risk label before adding it', async () => {
  const calls = [];
  const github = {
    rest: {
      issues: {
        getLabel: async () => { throw Object.assign(new Error('Not Found'), { status: 404 }); },
        createLabel: async args => { calls.push(['create', args.name]); },
        removeLabel: async args => { calls.push(['remove', args.name]); },
        addLabels: async args => { calls.push(['add', args.labels[0]]); },
      },
    },
  };
  const context = { repo: { owner: 'o', repo: 'r' } };
  const pr = { number: 1, labels: [{ name: 'risk:low' }] };
  await syncRiskLabel({ github, context, pr, level: 2 });
  assert.deepEqual(calls, [['create', 'risk:high'], ['remove', 'risk:low'], ['add', 'risk:high']]);
});

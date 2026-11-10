// Risk rules for the pr-template check (.github/workflows/pr-checks.yml).
// Plain CommonJS with no dependencies: loaded by actions/github-script and by `node --test`.

const LEVELS = ['Low', 'Medium', 'High'];

const RULES = [
  {
    level: 2,
    why: 'migrations, deploy, workflows, auth or infra',
    prefixes: [
      'supabase/migrations/',
      'deploy/',
      '.github/workflows/',
      '.github/scripts/',
    ],
    files: [
      'backend/app/auth.py',
      'frontend/next.config.js',
      'frontend/next.config.mjs',
      'frontend/next.config.ts',
      'vercel.json',
    ],
  },
  {
    level: 1,
    why: 'prompts, LLM code or evals',
    prefixes: ['backend/app/prompts/', 'evals/'],
    files: ['backend/app/llm.py', 'backend/app/config.py'],
  },
];

function ruleFor(path) {
  return RULES.find(r => r.files.includes(path) || r.prefixes.some(p => path.startsWith(p)));
}

// `files` are entries from pulls.listFiles. A rename counts under both its old and new path.
function riskFloor(files) {
  let floor = { level: 0, path: null, why: null };
  for (const f of files) {
    for (const path of [f.filename, f.previous_filename]) {
      if (!path) continue;
      const rule = ruleFor(path);
      if (rule && rule.level > floor.level) floor = { level: rule.level, path, why: rule.why };
    }
  }
  return floor;
}

// Index into LEVELS, or -1 when the body has no "Level:" line.
function declaredLevel(body) {
  const match = (body || '').match(/^Level:[ \t]*(Low|Medium|High)\b/im);
  if (!match) return -1;
  return LEVELS.findIndex(l => l.toLowerCase() === match[1].toLowerCase());
}

function diffWasRead(body) {
  return /^[ \t]*- \[[xX]\] I read the full diff\b/m.test(body || '');
}

function isDependabot(pr) {
  return pr.user?.login === 'dependabot[bot]';
}

// Returns an error message, or null when the PR passes. `level` is the label to apply.
function evaluate(pr, files) {
  const floor = riskFloor(files);
  if (isDependabot(pr)) return { level: floor.level, error: null };

  const level = declaredLevel(pr.body);
  if (level < 0) {
    return { level, error: 'PR body needs a line "Level: Low", "Level: Medium" or "Level: High" under Risk.' };
  }
  if (level < floor.level) {
    return {
      level,
      error:
        `${floor.path} is ${floor.why}, so Risk must be at least ${LEVELS[floor.level]} ` +
        `(declared: ${LEVELS[level]}).`,
    };
  }
  if (!pr.draft && !diffWasRead(pr.body)) {
    return { level, error: 'Tick "I read the full diff" under Authorship before marking the PR ready for review.' };
  }
  return { level, error: null };
}

const LABEL_COLORS = { low: '0E8A16', medium: 'FBCA04', high: 'B60205' };

// Keeps exactly one risk:* label on the PR, creating it in the repo if it is missing.
async function syncRiskLabel({ github, context, pr, level }) {
  const name = LEVELS[level].toLowerCase();
  const keep = `risk:${name}`;
  try {
    await github.rest.issues.getLabel({ ...context.repo, name: keep });
  } catch (e) {
    if (e.status !== 404) throw e;
    try {
      await github.rest.issues.createLabel({
        ...context.repo,
        name: keep,
        color: LABEL_COLORS[name],
        description: `${LEVELS[level]} risk change`,
      });
    } catch (err) {
      if (err.status !== 422) throw err;
    }
  }

  const current = (pr.labels || []).map(l => l.name);
  for (const label of current) {
    if (label.startsWith('risk:') && label !== keep) {
      await github.rest.issues.removeLabel({ ...context.repo, issue_number: pr.number, name: label });
    }
  }
  if (!current.includes(keep)) {
    await github.rest.issues.addLabels({ ...context.repo, issue_number: pr.number, labels: [keep] });
  }
}

module.exports = { LEVELS, riskFloor, declaredLevel, diffWasRead, isDependabot, evaluate, syncRiskLabel };

export const REQUIRED_COLUMNS = [
  'ID',
  'TITLE',
  'STEPS',
  'DATATEST',
  'EXPECTED RESULT',
  'ACTUAL RESULT',
  'STATUS',
  'COMMENT'
];

const STATUS_VALUES = new Set(['PASS', 'FAIL', 'PENDING']);
const REQUIRED_COLUMN_SET = new Set(REQUIRED_COLUMNS);
const TITLE_PREFIXES = ['Xác nhận', 'Xác minh', 'Kiểm tra'];
const GROUPING_HINTS = [
  /đăng nhập.*đăng xuất/i,
  /login.*logout/i,
  /thành công.*thành công/i
];
const DESTRUCTIVE_HINTS = [
  /xóa/i,
  /delete/i,
  /remove/i,
  /submit/i,
  /thanh toán/i,
  /payment/i,
  /gửi mail/i,
  /send email/i,
  /upload/i
];

const emptyCase = () => ({
  ID: '',
  TITLE: '',
  STEPS: [],
  DATATEST: '',
  'EXPECTED RESULT': '',
  'ACTUAL RESULT': '',
  STATUS: 'PENDING',
  COMMENT: ''
});

export function normalizeCases(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((raw, index) => {
    const merged = { ...emptyCase(), ...raw };
    const id = typeof merged.ID === 'string' && merged.ID.trim()
      ? merged.ID.trim()
      : `TC${String(index + 1).padStart(3, '0')}`;
    const steps = Array.isArray(merged.STEPS)
      ? merged.STEPS
      : String(merged.STEPS || '').split(/\n+/).filter(Boolean);

    return {
      ID: id,
      TITLE: String(merged.TITLE || '').trim(),
      STEPS: steps.map((step) => String(step).trim()).filter(Boolean),
      DATATEST: String(merged.DATATEST || '').trim(),
      'EXPECTED RESULT': String(merged['EXPECTED RESULT'] || '').trim(),
      'ACTUAL RESULT': String(merged['ACTUAL RESULT'] || '').trim(),
      STATUS: String(merged.STATUS || 'PENDING').trim().toUpperCase(),
      COMMENT: String(merged.COMMENT || '').trim()
    };
  });
}

const isBlank = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return typeof value !== 'string' || value.trim() === '';
};

const hasTitlePrefix = (title) => {
  const normalizedTitle = title.toLocaleLowerCase('vi');
  return TITLE_PREFIXES.some((prefix) => normalizedTitle.startsWith(prefix.toLocaleLowerCase('vi')));
};

const looksGrouped = (testcase) => {
  const joined = [
    testcase.TITLE,
    testcase['EXPECTED RESULT']
  ].join(' ');
  return GROUPING_HINTS.some((pattern) => pattern.test(joined));
};

const hasNumberedSteps = (steps) => steps.every((step, index) => {
  const expectedPrefix = `B${index + 1}:`;
  return step.startsWith(expectedPrefix) && step.length > expectedPrefix.length;
});

const looksDestructive = (testcase) => {
  const joined = [
    testcase.TITLE,
    testcase.DATATEST,
    testcase['EXPECTED RESULT'],
    ...testcase.STEPS
  ].join(' ');
  return DESTRUCTIVE_HINTS.some((pattern) => pattern.test(joined));
};

export function validateCases(input) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(input)) {
    return { valid: false, errors: ['testcase.json root must be an array'], warnings };
  }
  if (input.length === 0) {
    return { valid: false, errors: ['testcase.json must contain at least one testcase'], warnings };
  }

  const cases = normalizeCases(input);
  const seen = new Set();

  cases.forEach((testcase, index) => {
    const raw = input[index];
    const rawIsObject = raw && typeof raw === 'object' && !Array.isArray(raw);
    const label = testcase.ID || `row ${index + 1}`;

    if (!rawIsObject) {
      errors.push(`${label}: testcase row must be an object`);
      return;
    }

    for (const column of REQUIRED_COLUMNS) {
      if (!(column in raw)) {
        errors.push(`${label}: missing column ${column}`);
      }
    }
    for (const column of Object.keys(raw)) {
      if (!REQUIRED_COLUMN_SET.has(column)) {
        errors.push(`${label}: unexpected column ${column}`);
      }
    }

    if (seen.has(testcase.ID)) {
      errors.push(`${label}: duplicate ID`);
    }
    seen.add(testcase.ID);

    if (!/^TC\d{3,}$/.test(testcase.ID)) {
      errors.push(`${label}: ID must match TC001 format`);
    }
    if (!hasTitlePrefix(testcase.TITLE)) {
      errors.push(`${label}: TITLE must start with Xác nhận, Xác minh, or Kiểm tra`);
    }
    if (isBlank(testcase.STEPS)) {
      errors.push(`${label}: STEPS must contain at least one step`);
    } else if (!hasNumberedSteps(testcase.STEPS)) {
      errors.push(`${label}: STEPS must use B1:, B2: numbered steps in order`);
    }
    if (isBlank(testcase.DATATEST)) {
      errors.push(`${label}: DATATEST must not be empty`);
    }
    if (isBlank(testcase['EXPECTED RESULT'])) {
      errors.push(`${label}: EXPECTED RESULT must not be empty`);
    }
    if (!STATUS_VALUES.has(testcase.STATUS)) {
      errors.push(`${label}: STATUS must be PASS, FAIL, or PENDING`);
    }
    if (testcase.STATUS === 'PASS' && isBlank(testcase['ACTUAL RESULT'])) {
      errors.push(`${label}: PASS requires ACTUAL RESULT`);
    }
    if (testcase.STATUS === 'FAIL' && isBlank(testcase['ACTUAL RESULT'])) {
      errors.push(`${label}: FAIL requires ACTUAL RESULT`);
    }
    if (testcase.STATUS === 'FAIL' && isBlank(testcase.COMMENT)) {
      errors.push(`${label}: FAIL requires COMMENT`);
    }
    if (looksGrouped(testcase)) {
      errors.push(`${label}: grouped testcase detected; split this behavior`);
    }
    if (looksDestructive(testcase)) {
      warnings.push(`${label}: destructive or externally visible action requires explicit approval`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

export function summarizeCases(input) {
  const summary = { PASS: 0, FAIL: 0, PENDING: 0 };
  for (const testcase of normalizeCases(input)) {
    if (testcase.STATUS in summary) {
      summary[testcase.STATUS] += 1;
    }
  }
  return summary;
}

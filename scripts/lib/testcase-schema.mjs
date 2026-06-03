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
  /thành công.*thành công/i,
  /tag an toàn.*tag nguy hiểm/i,
  /tag nguy hiểm.*tag an toàn/i,
  /<strong\b.*<script\b|<script\b.*<strong\b/i,
  /<script\b.*<a\b|<a\b.*<script\b/i,
  /<object\b.*<embed\b|<embed\b.*<object\b/i,
  /<ul\b.*<ol\b|<ol\b.*<ul\b/i,
  /tất cả\s+\d+\s+url/i,
  /\b\d+\s+url\b/i,
  /nhiều\s+url/i,
  /url nội bộ.*url ngoài|url ngoài.*url nội bộ/i,
  /giữ lại.*loại bỏ|loại bỏ.*giữ lại/i
];
const AMBIGUOUS_RESULT_HINTS = [
  /\bhoặc\b/i,
  /có\s+thể/i,
  /tùy\s+(validation|rule|quy định|cấu hình|trường hợp)/i,
  /validation\s+rule/i,
  /\bnếu\s+(submit|gửi|thao tác)\s+được/i,
  /chưa\s+xác\s+định/i
];
const VAGUE_DATA_HINTS = [
  /một\s+.+\s+bất kỳ/i,
  /bất kỳ/i,
  /chuỗi\s+\d+\+\s*k[íy]\s*tự/i,
  /\d+\+\s*k[íy]\s*tự/i,
  /lorem\s+ipsum/i,
  /tất cả\s+\d+\s+url/i,
  /\b\d+\s+url\b/i,
  /nhiều\s+url/i
];
const VAGUE_STEP_HINTS = [
  /chọn\s+một\s+.+\s+bất kỳ/i,
  /nhập\s+chuỗi\s+\d+\+\s*k[íy]\s*tự/i,
  /nhập\s+.+\s+bất kỳ/i,
  /thực hiện\s+.+\s+bất kỳ/i
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

const formatSequentialId = (index) => `TC${String(index + 1).padStart(3, '0')}`;

export function normalizeCases(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((raw, index) => {
    const merged = { ...emptyCase(), ...raw };
    const steps = Array.isArray(merged.STEPS)
      ? merged.STEPS
      : String(merged.STEPS || '').split(/\n+/).filter(Boolean);

    return {
      ID: formatSequentialId(index),
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
    testcase.DATATEST,
    testcase['EXPECTED RESULT'],
    ...testcase.STEPS
  ].join(' ');
  return GROUPING_HINTS.some((pattern) => pattern.test(joined));
};

const hasAmbiguousResult = (result) => AMBIGUOUS_RESULT_HINTS.some((pattern) => pattern.test(result));
const hasVagueData = (data) => VAGUE_DATA_HINTS.some((pattern) => pattern.test(data));
const hasVagueSteps = (steps) => steps.some((step) => VAGUE_STEP_HINTS.some((pattern) => pattern.test(step)));

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
    const expectedId = formatSequentialId(index);
    const rawId = rawIsObject && typeof raw.ID === 'string' ? raw.ID.trim() : '';
    const label = rawId || `row ${index + 1}`;

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

    if (rawId && seen.has(rawId)) {
      errors.push(`${label}: duplicate ID`);
    }
    if (rawId) {
      seen.add(rawId);
    }

    if (rawId !== expectedId) {
      errors.push(`${label}: ID must be sequential TC001, TC002, ... in row order; expected ${expectedId}`);
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
    } else if (typeof raw.DATATEST !== 'string') {
      errors.push(`${label}: DATATEST must be a string`);
    } else if (hasVagueData(testcase.DATATEST)) {
      errors.push(`${label}: DATATEST must use concrete executable value, not vague placeholders`);
    }
    if (isBlank(testcase['EXPECTED RESULT'])) {
      errors.push(`${label}: EXPECTED RESULT must not be empty`);
    } else if (hasAmbiguousResult(testcase['EXPECTED RESULT'])) {
      errors.push(`${label}: EXPECTED RESULT must be deterministic and contain exactly one outcome`);
    }
    if (!isBlank(testcase['ACTUAL RESULT']) && hasAmbiguousResult(testcase['ACTUAL RESULT'])) {
      errors.push(`${label}: ACTUAL RESULT must be deterministic and contain exactly one observed outcome`);
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
    if (!isBlank(testcase.STEPS) && hasVagueSteps(testcase.STEPS)) {
      errors.push(`${label}: STEPS must use concrete executable action, not vague placeholders`);
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

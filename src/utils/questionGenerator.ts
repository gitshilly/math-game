import { getGradeConfig, getOperationsByDifficulty, OperationConfig } from './gradeConfig';

export interface Question {
  id: number;
  expression: string;       // Display expression e.g. "23 + 45 = ?"
  answer: number;            // Correct answer
  operationType: string;     // Type for generating similar questions
  difficulty: number;        // 1-4 difficulty tier
  isFraction?: boolean;      // Whether it's a fraction question
  fractionAnswer?: string;   // Fraction answer as string e.g. "3/4"
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundDecimal(num: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(num * factor) / factor;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function simplifyFraction(num: number, den: number): [number, number] {
  const g = gcd(num, den);
  return [num / g, den / g];
}

// ====== Basic operations ======

function generateAddSubQuestion(op: OperationConfig, id: number): Question {
  const isAdd = op.type === 'add';
  let a = randInt(op.minA, op.maxA);
  let b = randInt(op.minB, op.maxB);

  if (!isAdd && !op.allowNegativeResult && a < b) {
    [a, b] = [b, a];
  }

  const answer = isAdd ? a + b : a - b;
  const symbol = isAdd ? '+' : '-';

  return {
    id,
    expression: `${a} ${symbol} ${b}`,
    answer,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

function generateMulDivQuestion(op: OperationConfig, id: number): Question {
  const isMul = op.type === 'mul';

  if (isMul) {
    const a = randInt(op.minA, op.maxA);
    const b = randInt(op.minB, op.maxB);
    return {
      id,
      expression: `${a} × ${b}`,
      answer: a * b,
      operationType: op.type,
      difficulty: op.difficulty,
    };
  } else {
    // Division: ensure clean division
    const b = randInt(op.minB, op.maxB);
    const minQ = Math.max(2, Math.ceil(op.minA / op.maxB));
    const maxQ = Math.max(minQ, Math.floor(op.maxA / Math.max(1, op.minB)));
    const quotient = randInt(minQ, maxQ);
    const a = b * quotient;

    return {
      id,
      expression: `${a} ÷ ${b}`,
      answer: quotient,
      operationType: op.type,
      difficulty: op.difficulty,
    };
  }
}

// ====== Decimal operations ======

function generateDecimalQuestion(op: OperationConfig, id: number): Question {
  const places = op.decimalPlaces || 1;
  const factor = Math.pow(10, places);

  let a = roundDecimal(randInt(op.minA * factor, op.maxA * factor) / factor, places);
  let b = roundDecimal(randInt(op.minB * factor, op.maxB * factor) / factor, places);

  let answer: number;
  let symbol: string;

  switch (op.type) {
    case 'decimal_add':
      answer = roundDecimal(a + b, places);
      symbol = '+';
      break;
    case 'decimal_sub':
      if (a < b) [a, b] = [b, a];
      answer = roundDecimal(a - b, places);
      symbol = '-';
      break;
    case 'decimal_mul':
      answer = roundDecimal(a * b, places + 1);
      symbol = '×';
      break;
    case 'decimal_div': {
      // ensure clean division with decimal
      const intB = randInt(2, 10);
      const intResult = randInt(op.minA, op.maxA);
      a = roundDecimal(intB * intResult / factor, places);
      b = intB;
      answer = roundDecimal(intResult / factor, places);
      symbol = '÷';
      break;
    }
    default:
      answer = 0;
      symbol = '+';
  }

  return {
    id,
    expression: `${a} ${symbol} ${b}`,
    answer,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// ====== Fraction operations ======

function generateFractionQuestion(op: OperationConfig, id: number): Question {
  const den1 = randInt(2, op.maxA);
  const num1 = randInt(1, den1 - 1);
  const den2 = randInt(2, op.maxB);
  const num2 = randInt(1, den2 - 1);

  let resultNum: number;
  let resultDen: number;
  let symbol: string;

  switch (op.type) {
    case 'fraction_add':
      resultNum = num1 * den2 + num2 * den1;
      resultDen = den1 * den2;
      symbol = '+';
      break;
    case 'fraction_sub':
      resultNum = num1 * den2 - num2 * den1;
      resultDen = den1 * den2;
      if (resultNum < 0) {
        resultNum = num2 * den1 - num1 * den2;
        resultDen = den1 * den2;
        const [sNum, sDen] = simplifyFraction(resultNum, resultDen);
        return {
          id,
          expression: `${num2}/${den2} - ${num1}/${den1}`,
          answer: sNum / sDen,
          operationType: op.type,
          difficulty: op.difficulty,
          isFraction: true,
          fractionAnswer: sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`,
        };
      }
      symbol = '-';
      break;
    case 'fraction_mul':
      resultNum = num1 * num2;
      resultDen = den1 * den2;
      symbol = '×';
      break;
    case 'fraction_div':
      resultNum = num1 * den2;
      resultDen = den1 * num2;
      symbol = '÷';
      break;
    default:
      resultNum = 0;
      resultDen = 1;
      symbol = '+';
  }

  const [sNum, sDen] = simplifyFraction(resultNum, resultDen);

  return {
    id,
    expression: `${num1}/${den1} ${symbol} ${num2}/${den2}`,
    answer: roundDecimal(sNum / sDen, 4),
    operationType: op.type,
    difficulty: op.difficulty,
    isFraction: true,
    fractionAnswer: sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`,
  };
}

// ====== Mixed operations ======

function generateMixedQuestion(op: OperationConfig, id: number): Question {
  const a = randInt(op.minA, op.maxA);
  const b = randInt(op.minB, op.maxB);
  const c = randInt(2, 20);

  const patterns = op.hasBrackets
    ? [
        { expr: `(${a} + ${b}) × ${c}`, ans: (a + b) * c },
        { expr: `(${a} - ${Math.min(b, a - 1 > 0 ? a - 1 : 1)}) × ${c}`, ans: (a - Math.min(b, a - 1 > 0 ? a - 1 : 1)) * c },
        { expr: `${a} × ${c} + ${b}`, ans: a * c + b },
        { expr: `${a} × ${c} - ${b}`, ans: a * c - b },
        { expr: `${a} + ${b} × ${c}`, ans: a + b * c },
      ]
    : [
        { expr: `${a} + ${b} × ${c}`, ans: a + b * c },
        { expr: `${a} × ${c} + ${b}`, ans: a * c + b },
        { expr: `${a} × ${c} - ${b}`, ans: a * c - b },
      ];

  const validPatterns = patterns.filter(p => p.ans >= 0 && Number.isInteger(p.ans));
  const pattern = validPatterns.length > 0
    ? validPatterns[randInt(0, validPatterns.length - 1)]
    : patterns[0];

  return {
    id,
    expression: pattern.expr,
    answer: Math.abs(pattern.ans),
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// ====== 运算律题目 ======

// 加法交换律: a + b = b + ?   (答案是 a)
function generateCommutativeAddQuestion(op: OperationConfig, id: number): Question {
  const a = randInt(op.minA, op.maxA);
  const b = randInt(op.minB, op.maxB);

  return {
    id,
    expression: `${a} + ${b} = ${b} + ?`,
    answer: a,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// 乘法交换律: a × b = b × ?   (答案是 a)
function generateCommutativeMulQuestion(op: OperationConfig, id: number): Question {
  const a = randInt(op.minA, op.maxA);
  const b = randInt(op.minB, op.maxB);

  return {
    id,
    expression: `${a} × ${b} = ${b} × ?`,
    answer: a,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// 加法结合律: (a + b) + c = a + (b + ?)   (答案是 c)
function generateAssociativeAddQuestion(op: OperationConfig, id: number): Question {
  const a = randInt(op.minA, op.maxA);
  const b = randInt(op.minB, op.maxB);
  // Pick c so that b + c is a round number (makes it a useful "简便" problem)
  const roundTarget = Math.ceil((b + 1) / 10) * 10;
  const c = roundTarget - b > 0 ? roundTarget - b : randInt(op.minB, op.maxB);

  return {
    id,
    expression: `(${a} + ${b}) + ${c} = ${a} + (${b} + ?)`,
    answer: c,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// 乘法结合律: (a × b) × c = a × (b × ?)   (答案是 c)
function generateAssociativeMulQuestion(op: OperationConfig, id: number): Question {
  // Use numbers that make sense for associative law, e.g. 25 × 4 = 100
  const niceGroups = [
    { a: 25, b: 4 }, { a: 5, b: 2 }, { a: 125, b: 8 }, { a: 50, b: 2 },
    { a: 4, b: 25 }, { a: 8, b: 125 }, { a: 20, b: 5 },
  ];

  const filteredGroups = niceGroups.filter(
    g => g.a >= op.minA && g.a <= op.maxA && g.b >= op.minB && g.b <= op.maxB
  );

  let a: number, b: number, c: number;

  if (filteredGroups.length > 0) {
    const group = filteredGroups[randInt(0, filteredGroups.length - 1)];
    a = group.a;
    b = group.b;
    c = randInt(2, 15);
  } else {
    a = randInt(op.minA, op.maxA);
    b = randInt(op.minB, op.maxB);
    c = randInt(2, 10);
  }

  // Random pattern: (a × b) × c = a × (b × ?)
  return {
    id,
    expression: `(${a} × ${b}) × ${c} = ${a} × (${b} × ?)`,
    answer: c,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// 乘法分配律: a × (b + c) = a × b + a × ?   (答案是 c)
// 或: a × b + a × c = a × (b + ?)   (答案是 c)
function generateDistributiveQuestion(op: OperationConfig, id: number): Question {
  const a = randInt(op.minA, op.maxA);
  const b = randInt(op.minB, op.maxB);
  const c = randInt(1, 30);

  const patterns = [
    // 展开形式: a × (b + c) = a × b + a × ?
    {
      expr: `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ?`,
      ans: c,
    },
    // 合并形式: a × b + a × c = a × (b + ?)
    {
      expr: `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ?)`,
      ans: c,
    },
    // 减法分配律: a × (b - c) = a × b - a × ?  (ensure b > c)
    ...(b > c ? [{
      expr: `${a} × (${b} - ${c}) = ${a} × ${b} - ${a} × ?`,
      ans: c,
    }] : []),
    // 计算结果型: a × (b + c) = ?
    {
      expr: `${a} × (${b} + ${c})`,
      ans: a * (b + c),
    },
  ];

  // Alternate between fill-in-the-blank and compute
  const pattern = patterns[randInt(0, patterns.length - 1)];

  return {
    id,
    expression: pattern.expr,
    answer: pattern.ans,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// 简便运算: clever computation patterns
function generateSmartCalcQuestion(op: OperationConfig, id: number): Question {
  const patternType = randInt(0, 5);

  let expression: string;
  let answer: number;

  switch (patternType) {
    case 0: {
      // 99 × a + a = 100 × a  (乘法分配律凑整)
      const a = randInt(2, 50);
      const near100 = [99, 98, 101, 102][randInt(0, 3)];
      expression = `${near100} × ${a} + ${near100 <= 100 ? (100 - near100) : 0} × ${a}`;
      if (near100 < 100) {
        expression = `${near100} × ${a} + ${100 - near100} × ${a}`;
        answer = 100 * a;
      } else {
        expression = `${near100} × ${a} - ${near100 - 100} × ${a}`;
        answer = 100 * a;
      }
      break;
    }
    case 1: {
      // a × 99 = a × 100 - a  (拆分凑整)
      const a = randInt(2, 40);
      expression = `${a} × 99`;
      answer = a * 99;
      break;
    }
    case 2: {
      // 25 × a × 4 = ?  (结合律凑整)
      const a = randInt(2, 30);
      expression = `25 × ${a} × 4`;
      answer = 25 * a * 4;
      break;
    }
    case 3: {
      // 125 × a × 8 = ?  (结合律凑整)
      const a = randInt(2, 15);
      expression = `125 × ${a} × 8`;
      answer = 125 * a * 8;
      break;
    }
    case 4: {
      // a × 102 = a × 100 + a × 2  (分配律)
      const a = randInt(5, 50);
      const n = [101, 102, 201, 99, 98][randInt(0, 4)];
      expression = `${a} × ${n}`;
      answer = a * n;
      break;
    }
    case 5: {
      // (a + b) × c where a + b is a round number
      const c = randInt(3, 20);
      const roundSum = [100, 200, 50, 1000][randInt(0, 3)];
      const a = randInt(10, roundSum - 10);
      const b = roundSum - a;
      expression = `(${a} + ${b}) × ${c}`;
      answer = roundSum * c;
      break;
    }
    default: {
      const a = randInt(2, 50);
      expression = `${a} × 99`;
      answer = a * 99;
    }
  }

  return {
    id,
    expression,
    answer,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// 连减简便: a - b - c = a - (b + ?)   (答案是 c)
function generateSubtractGroupQuestion(op: OperationConfig, id: number): Question {
  const a = randInt(op.minA, op.maxA);
  const b = randInt(op.minB, op.maxB);
  // Pick c so that b + c is a round number for easier mental math
  const roundTarget = Math.ceil((b + 1) / 100) * 100;
  const c = roundTarget - b > 0 && roundTarget - b <= op.maxB ? roundTarget - b : randInt(op.minB, op.maxB);

  // Make sure a > b + c
  const safeA = Math.max(a, b + c + 10);

  const patterns = [
    // Fill in the blank: a - b - c = a - (b + ?)
    {
      expr: `${safeA} - ${b} - ${c} = ${safeA} - (${b} + ?)`,
      ans: c,
    },
    // Compute: a - b - c = ?
    {
      expr: `${safeA} - ${b} - ${c}`,
      ans: safeA - b - c,
    },
  ];

  const pattern = patterns[randInt(0, patterns.length - 1)];

  return {
    id,
    expression: pattern.expr,
    answer: pattern.ans,
    operationType: op.type,
    difficulty: op.difficulty,
  };
}

// ====== Main dispatcher ======

function generateSingleQuestion(op: OperationConfig, id: number): Question {
  switch (op.type) {
    case 'add':
    case 'sub':
      return generateAddSubQuestion(op, id);
    case 'mul':
    case 'div':
      return generateMulDivQuestion(op, id);
    case 'decimal_add':
    case 'decimal_sub':
    case 'decimal_mul':
    case 'decimal_div':
      return generateDecimalQuestion(op, id);
    case 'fraction_add':
    case 'fraction_sub':
    case 'fraction_mul':
    case 'fraction_div':
      return generateFractionQuestion(op, id);
    case 'mixed':
      return generateMixedQuestion(op, id);
    case 'commutative_add':
      return generateCommutativeAddQuestion(op, id);
    case 'commutative_mul':
      return generateCommutativeMulQuestion(op, id);
    case 'associative_add':
      return generateAssociativeAddQuestion(op, id);
    case 'associative_mul':
      return generateAssociativeMulQuestion(op, id);
    case 'distributive':
      return generateDistributiveQuestion(op, id);
    case 'smart_calc':
      return generateSmartCalcQuestion(op, id);
    case 'subtract_group':
      return generateSubtractGroupQuestion(op, id);
    default:
      return generateAddSubQuestion(op, id);
  }
}

/**
 * Generate questions with progressive difficulty:
 * - Questions 1-3 (index 0-2): Tier 1 (easy)
 * - Questions 4-6 (index 3-5): Tier 2 (medium)
 * - Questions 7-9 (index 6-8): Tier 3 (hard)
 * - Question 10  (index 9):    Tier 4 (challenge)
 */
export function generateQuestions(grade: number, count: number = 10): Question[] {
  const questions: Question[] = [];

  // Define difficulty distribution for 10 questions
  const difficultyMap: number[] = [
    1, 1, 1,   // Questions 1-3: easy
    2, 2, 2,   // Questions 4-6: medium
    3, 3, 3,   // Questions 7-9: hard
    4,         // Question 10: challenge
  ];

  for (let i = 0; i < count; i++) {
    const targetDifficulty = difficultyMap[i] || Math.min(Math.ceil((i + 1) / 3), 4);

    // Get operations at this difficulty level
    let ops = getOperationsByDifficulty(grade, targetDifficulty);

    // Fallback: if no ops at this tier, try adjacent tiers
    if (ops.length === 0) {
      ops = getOperationsByDifficulty(grade, Math.max(1, targetDifficulty - 1));
    }
    if (ops.length === 0) {
      ops = getOperationsByDifficulty(grade, Math.min(4, targetDifficulty + 1));
    }
    if (ops.length === 0) {
      // Last resort: pick any operation from this grade
      const config = getGradeConfig(grade);
      ops = config.operations;
    }

    const op = ops[randInt(0, ops.length - 1)];
    questions.push(generateSingleQuestion(op, i));
  }

  return questions;
}

export function generateSimilarQuestions(
  wrongQuestions: Question[],
  grade: number,
  countPerWrong: number = 10
): Question[] {
  const config = getGradeConfig(grade);
  const questions: Question[] = [];

  // Collect unique wrong types with their difficulties
  const wrongTypes = [...new Set(wrongQuestions.map(q => q.operationType))];
  const questionsPerType = Math.ceil(countPerWrong / wrongTypes.length);

  let id = 0;
  for (const wrongType of wrongTypes) {
    // Find the exact operation config that matches type
    const op = config.operations.find(o => o.type === wrongType) || config.operations[0];
    for (let i = 0; i < questionsPerType && questions.length < countPerWrong; i++) {
      questions.push(generateSingleQuestion(op, id++));
    }
  }

  return questions;
}

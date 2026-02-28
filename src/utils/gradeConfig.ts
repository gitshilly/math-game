// 沪教版各年级数学题目配置
export interface GradeConfig {
  grade: number;
  label: string;
  description: string;
  icon: string;
  // Operations grouped by difficulty tier (1=easy, 2=medium, 3=hard, 4=challenge)
  operations: OperationConfig[];
}

export type OperationType =
  | 'add' | 'sub' | 'mul' | 'div'
  | 'mixed'
  | 'decimal_add' | 'decimal_sub' | 'decimal_mul' | 'decimal_div'
  | 'fraction_add' | 'fraction_sub' | 'fraction_mul' | 'fraction_div'
  // 运算律
  | 'commutative_add'    // 加法交换律: a + b = b + ?
  | 'commutative_mul'    // 乘法交换律: a × b = b × ?
  | 'associative_add'    // 加法结合律: (a+b)+c = a+(b+?)
  | 'associative_mul'    // 乘法结合律: (a×b)×c = a×(b×?)
  | 'distributive'       // 乘法分配律: a×(b+c) = a×b + a×?
  | 'smart_calc'         // 简便运算: 99×25+25 = ?
  | 'subtract_group';    // 连减简便: a-b-c = a-(b+?)

export interface OperationConfig {
  type: OperationType;
  label: string;
  minA: number;
  maxA: number;
  minB: number;
  maxB: number;
  difficulty: number;        // 1=easy, 2=medium, 3=hard, 4=challenge
  allowNegativeResult?: boolean;
  decimalPlaces?: number;
  hasBrackets?: boolean;
}

export const GRADE_CONFIGS: GradeConfig[] = [
  {
    grade: 1,
    label: '一年级',
    description: '20以内加减法',
    icon: '🌱',
    operations: [
      // Tier 1 - Easy
      { type: 'add', label: '加法', minA: 1, maxA: 5, minB: 1, maxB: 5, difficulty: 1 },
      { type: 'sub', label: '减法', minA: 2, maxA: 10, minB: 1, maxB: 5, allowNegativeResult: false, difficulty: 1 },
      // Tier 2 - Medium
      { type: 'add', label: '加法', minA: 5, maxA: 10, minB: 1, maxB: 10, difficulty: 2 },
      { type: 'sub', label: '减法', minA: 6, maxA: 15, minB: 1, maxB: 8, allowNegativeResult: false, difficulty: 2 },
      // Tier 3 - Hard
      { type: 'add', label: '加法', minA: 8, maxA: 12, minB: 5, maxB: 10, difficulty: 3 },
      { type: 'sub', label: '减法', minA: 10, maxA: 20, minB: 3, maxB: 10, allowNegativeResult: false, difficulty: 3 },
      // Tier 4 - Challenge
      { type: 'add', label: '凑十法', minA: 7, maxA: 13, minB: 7, maxB: 10, difficulty: 4 },
    ]
  },
  {
    grade: 2,
    label: '二年级',
    description: '100以内加减法，乘法口诀',
    icon: '🌿',
    operations: [
      // Tier 1 - Easy
      { type: 'add', label: '加法', minA: 10, maxA: 50, minB: 1, maxB: 30, difficulty: 1 },
      { type: 'sub', label: '减法', minA: 10, maxA: 50, minB: 1, maxB: 20, allowNegativeResult: false, difficulty: 1 },
      { type: 'mul', label: '乘法口诀', minA: 1, maxA: 5, minB: 1, maxB: 5, difficulty: 1 },
      // Tier 2 - Medium
      { type: 'add', label: '加法', minA: 30, maxA: 99, minB: 10, maxB: 60, difficulty: 2 },
      { type: 'mul', label: '乘法口诀', minA: 2, maxA: 9, minB: 2, maxB: 9, difficulty: 2 },
      { type: 'commutative_add', label: '加法交换律', minA: 10, maxA: 50, minB: 10, maxB: 50, difficulty: 2 },
      // Tier 3 - Hard
      { type: 'sub', label: '减法', minA: 50, maxA: 99, minB: 10, maxB: 50, allowNegativeResult: false, difficulty: 3 },
      { type: 'add', label: '进位加法', minA: 50, maxA: 99, minB: 30, maxB: 99, difficulty: 3 },
      // Tier 4 - Challenge
      { type: 'commutative_add', label: '加法交换律', minA: 30, maxA: 99, minB: 30, maxB: 99, difficulty: 4 },
    ]
  },
  {
    grade: 3,
    label: '三年级',
    description: '1000以内运算，运算律入门',
    icon: '🌳',
    operations: [
      // Tier 1 - Easy
      { type: 'add', label: '加法', minA: 100, maxA: 500, minB: 10, maxB: 300, difficulty: 1 },
      { type: 'sub', label: '减法', minA: 100, maxA: 500, minB: 10, maxB: 200, allowNegativeResult: false, difficulty: 1 },
      { type: 'mul', label: '乘法', minA: 10, maxA: 30, minB: 2, maxB: 5, difficulty: 1 },
      // Tier 2 - Medium
      { type: 'mul', label: '乘法', minA: 10, maxA: 99, minB: 2, maxB: 9, difficulty: 2 },
      { type: 'div', label: '除法', minA: 10, maxA: 50, minB: 2, maxB: 9, difficulty: 2 },
      { type: 'commutative_mul', label: '乘法交换律', minA: 5, maxA: 30, minB: 2, maxB: 9, difficulty: 2 },
      // Tier 3 - Hard
      { type: 'div', label: '除法', minA: 20, maxA: 99, minB: 2, maxB: 9, difficulty: 3 },
      { type: 'mixed', label: '混合运算', minA: 5, maxA: 30, minB: 2, maxB: 15, difficulty: 3 },
      { type: 'associative_add', label: '加法结合律', minA: 10, maxA: 100, minB: 10, maxB: 100, difficulty: 3 },
      // Tier 4 - Challenge
      { type: 'mixed', label: '混合运算', minA: 10, maxA: 50, minB: 2, maxB: 20, hasBrackets: true, difficulty: 4 },
      { type: 'commutative_mul', label: '乘法交换律', minA: 10, maxA: 99, minB: 2, maxB: 9, difficulty: 4 },
    ]
  },
  {
    grade: 4,
    label: '四年级',
    description: '万以内运算，运算律与简便运算',
    icon: '🌲',
    operations: [
      // Tier 1 - Easy
      { type: 'add', label: '加法', minA: 100, maxA: 2000, minB: 100, maxB: 2000, difficulty: 1 },
      { type: 'sub', label: '减法', minA: 500, maxA: 5000, minB: 100, maxB: 2000, allowNegativeResult: false, difficulty: 1 },
      { type: 'mul', label: '乘法', minA: 100, maxA: 300, minB: 10, maxB: 30, difficulty: 1 },
      // Tier 2 - Medium
      { type: 'mul', label: '乘法', minA: 100, maxA: 999, minB: 10, maxB: 99, difficulty: 2 },
      { type: 'div', label: '除法', minA: 100, maxA: 500, minB: 10, maxB: 50, difficulty: 2 },
      { type: 'commutative_mul', label: '乘法交换律', minA: 10, maxA: 100, minB: 10, maxB: 50, difficulty: 2 },
      { type: 'mixed', label: '混合运算', minA: 10, maxA: 100, minB: 2, maxB: 30, difficulty: 2 },
      // Tier 3 - Hard
      { type: 'associative_mul', label: '乘法结合律', minA: 4, maxA: 25, minB: 2, maxB: 8, difficulty: 3 },
      { type: 'distributive', label: '乘法分配律', minA: 5, maxA: 50, minB: 10, maxB: 100, difficulty: 3 },
      { type: 'mixed', label: '带括号混合运算', minA: 10, maxA: 200, minB: 2, maxB: 50, hasBrackets: true, difficulty: 3 },
      { type: 'subtract_group', label: '连减简便', minA: 200, maxA: 1000, minB: 50, maxB: 200, difficulty: 3 },
      // Tier 4 - Challenge
      { type: 'smart_calc', label: '简便运算', minA: 10, maxA: 100, minB: 10, maxB: 100, difficulty: 4 },
      { type: 'distributive', label: '分配律挑战', minA: 20, maxA: 100, minB: 50, maxB: 500, difficulty: 4 },
      { type: 'associative_mul', label: '结合律挑战', minA: 5, maxA: 50, minB: 4, maxB: 25, difficulty: 4 },
    ]
  },
  {
    grade: 5,
    label: '五年级',
    description: '小数运算，运算律综合应用',
    icon: '🏔️',
    operations: [
      // Tier 1 - Easy
      { type: 'decimal_add', label: '小数加法', minA: 1, maxA: 50, minB: 1, maxB: 50, decimalPlaces: 1, difficulty: 1 },
      { type: 'decimal_sub', label: '小数减法', minA: 10, maxA: 50, minB: 1, maxB: 30, decimalPlaces: 1, allowNegativeResult: false, difficulty: 1 },
      // Tier 2 - Medium
      { type: 'decimal_add', label: '小数加法', minA: 10, maxA: 100, minB: 10, maxB: 100, decimalPlaces: 1, difficulty: 2 },
      { type: 'decimal_mul', label: '小数乘法', minA: 1, maxA: 20, minB: 1, maxB: 5, decimalPlaces: 1, difficulty: 2 },
      { type: 'distributive', label: '分配律', minA: 5, maxA: 50, minB: 10, maxB: 100, difficulty: 2 },
      // Tier 3 - Hard
      { type: 'decimal_mul', label: '小数乘法', minA: 1, maxA: 50, minB: 1, maxB: 10, decimalPlaces: 1, difficulty: 3 },
      { type: 'decimal_div', label: '小数除法', minA: 1, maxA: 50, minB: 1, maxB: 10, decimalPlaces: 1, difficulty: 3 },
      { type: 'smart_calc', label: '简便运算', minA: 10, maxA: 100, minB: 10, maxB: 100, difficulty: 3 },
      // Tier 4 - Challenge
      { type: 'smart_calc', label: '简便运算挑战', minA: 20, maxA: 200, minB: 20, maxB: 200, difficulty: 4 },
      { type: 'mixed', label: '综合混合运算', minA: 10, maxA: 500, minB: 2, maxB: 100, hasBrackets: true, difficulty: 4 },
    ]
  },
  {
    grade: 6,
    label: '六年级',
    description: '分数运算，比和百分比',
    icon: '🏆',
    operations: [
      // Tier 1 - Easy
      { type: 'fraction_add', label: '同分母分数加法', minA: 1, maxA: 6, minB: 1, maxB: 6, difficulty: 1 },
      { type: 'fraction_sub', label: '同分母分数减法', minA: 1, maxA: 6, minB: 1, maxB: 6, difficulty: 1 },
      // Tier 2 - Medium
      { type: 'fraction_add', label: '异分母分数加法', minA: 2, maxA: 10, minB: 2, maxB: 10, difficulty: 2 },
      { type: 'fraction_sub', label: '异分母分数减法', minA: 2, maxA: 10, minB: 2, maxB: 10, difficulty: 2 },
      { type: 'fraction_mul', label: '分数乘法', minA: 1, maxA: 8, minB: 1, maxB: 8, difficulty: 2 },
      // Tier 3 - Hard
      { type: 'fraction_mul', label: '分数乘法', minA: 2, maxA: 12, minB: 2, maxB: 12, difficulty: 3 },
      { type: 'fraction_div', label: '分数除法', minA: 2, maxA: 12, minB: 2, maxB: 12, difficulty: 3 },
      // Tier 4 - Challenge
      { type: 'fraction_div', label: '分数除法挑战', minA: 3, maxA: 12, minB: 3, maxB: 12, difficulty: 4 },
      { type: 'smart_calc', label: '简便运算', minA: 10, maxA: 100, minB: 10, maxB: 100, difficulty: 4 },
    ]
  },
];

export function getGradeConfig(grade: number): GradeConfig {
  return GRADE_CONFIGS.find(g => g.grade === grade) || GRADE_CONFIGS[3]; // Default to grade 4
}

// Get operations filtered by difficulty tier
export function getOperationsByDifficulty(grade: number, difficulty: number): OperationConfig[] {
  const config = getGradeConfig(grade);
  return config.operations.filter(op => op.difficulty === difficulty);
}

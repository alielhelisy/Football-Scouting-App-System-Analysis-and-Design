const logic = require('../src/logic');

// ── validatePlayerName ─────────────────────────────────────────────────────
describe('validatePlayerName', () => {
  test('returns null for valid name', () => {
    expect(logic.validatePlayerName('Mohamed Salah')).toBeNull();
  });
  test('returns null for name with exactly 100 chars', () => {
    expect(logic.validatePlayerName('a'.repeat(100))).toBeNull();
  });
  test('rejects null', () => {
    expect(logic.validatePlayerName(null)).not.toBeNull();
  });
  test('rejects empty string', () => {
    expect(logic.validatePlayerName('')).not.toBeNull();
  });
  test('rejects whitespace-only string', () => {
    expect(logic.validatePlayerName('   ')).not.toBeNull();
  });
  test('rejects name over 100 chars', () => {
    expect(logic.validatePlayerName('a'.repeat(101))).not.toBeNull();
  });
});

// ── validateTeam ───────────────────────────────────────────────────────────
describe('validateTeam', () => {
  test('returns null for valid team', () => {
    expect(logic.validateTeam('Liverpool FC')).toBeNull();
  });
  test('returns null for team with exactly 100 chars', () => {
    expect(logic.validateTeam('a'.repeat(100))).toBeNull();
  });
  test('rejects empty string', () => {
    expect(logic.validateTeam('')).not.toBeNull();
  });
  test('rejects whitespace-only string', () => {
    expect(logic.validateTeam('   ')).not.toBeNull();
  });
  test('rejects team over 100 chars', () => {
    expect(logic.validateTeam('a'.repeat(101))).not.toBeNull();
  });
});

// ── validatePosition ───────────────────────────────────────────────────────
describe('validatePosition', () => {
  test.each(logic.VALID_POSITIONS)('returns null for valid position %s', (pos) => {
    expect(logic.validatePosition(pos)).toBeNull();
  });
  test('rejects invalid position', () => {
    expect(logic.validatePosition('GK')).not.toBeNull();
  });
  test('rejects empty string', () => {
    expect(logic.validatePosition('')).not.toBeNull();
  });
  test('rejects null', () => {
    expect(logic.validatePosition(null)).not.toBeNull();
  });
  test('is case sensitive', () => {
    expect(logic.validatePosition('cb')).not.toBeNull();
  });
});

// ── validateRating ─────────────────────────────────────────────────────────
describe('validateRating', () => {
  test.each([1, 2, 3, 4, 5])('returns null for rating %i', (r) => {
    expect(logic.validateRating(r)).toBeNull();
  });
  test('rejects 0', () => {
    expect(logic.validateRating(0)).not.toBeNull();
  });
  test('rejects 6', () => {
    expect(logic.validateRating(6)).not.toBeNull();
  });
  test('rejects float', () => {
    expect(logic.validateRating(3.5)).not.toBeNull();
  });
  test('rejects string', () => {
    expect(logic.validateRating('five')).not.toBeNull();
  });
});

// ── validateNonNegativeInt ─────────────────────────────────────────────────
describe('validateNonNegativeInt', () => {
  test('returns null for 0', () => {
    expect(logic.validateNonNegativeInt(0, 'field')).toBeNull();
  });
  test('returns null for positive integer', () => {
    expect(logic.validateNonNegativeInt(90, 'Minutes played')).toBeNull();
  });
  test('rejects negative integer', () => {
    expect(logic.validateNonNegativeInt(-1, 'field')).not.toBeNull();
  });
  test('rejects float', () => {
    expect(logic.validateNonNegativeInt(1.5, 'field')).not.toBeNull();
  });
  test('rejects NaN', () => {
    expect(logic.validateNonNegativeInt(NaN, 'field')).not.toBeNull();
  });
  test('error message includes field name', () => {
    const msg = logic.validateNonNegativeInt(-1, 'Minutes played');
    expect(msg).toContain('Minutes played');
  });
});

// ── validateCards ──────────────────────────────────────────────────────────
describe('validateCards', () => {
  test.each(logic.VALID_CARDS)('returns null for %s', (card) => {
    expect(logic.validateCards(card)).toBeNull();
  });
  test('rejects invalid card value', () => {
    expect(logic.validateCards('Blue')).not.toBeNull();
  });
  test('rejects empty string', () => {
    expect(logic.validateCards('')).not.toBeNull();
  });
  test('is case sensitive', () => {
    expect(logic.validateCards('yellow')).not.toBeNull();
  });
});

// ── computeAverageRating ───────────────────────────────────────────────────
describe('computeAverageRating', () => {
  test('returns null for empty array', () => {
    expect(logic.computeAverageRating([])).toBeNull();
  });
  test('returns null for null', () => {
    expect(logic.computeAverageRating(null)).toBeNull();
  });
  test('returns exact rating for single report', () => {
    expect(logic.computeAverageRating([{ rating: 4 }])).toBe(4);
  });
  test('computes average of multiple reports', () => {
    expect(logic.computeAverageRating([{ rating: 4 }, { rating: 2 }, { rating: 3 }])).toBe(3);
  });
  test('rounds to one decimal place', () => {
    expect(logic.computeAverageRating([{ rating: 4 }, { rating: 3 }])).toBe(3.5);
  });
  test('handles all 5s', () => {
    const reports = [{ rating: 5 }, { rating: 5 }, { rating: 5 }];
    expect(logic.computeAverageRating(reports)).toBe(5);
  });
});

// ── filterPlayersByPosition ────────────────────────────────────────────────
describe('filterPlayersByPosition', () => {
  const players = [
    { id: 1, name: 'A', position: 'CB' },
    { id: 2, name: 'B', position: 'CF' },
    { id: 3, name: 'C', position: 'CB' },
    { id: 4, name: 'D', position: 'WIDE' },
  ];

  test('returns all players when position is empty string', () => {
    expect(logic.filterPlayersByPosition(players, '')).toHaveLength(4);
  });
  test('returns all players when position is null', () => {
    expect(logic.filterPlayersByPosition(players, null)).toHaveLength(4);
  });
  test('filters by CB correctly', () => {
    const result = logic.filterPlayersByPosition(players, 'CB');
    expect(result).toHaveLength(2);
    expect(result.every(p => p.position === 'CB')).toBe(true);
  });
  test('returns empty array when no match', () => {
    expect(logic.filterPlayersByPosition(players, '6ER')).toHaveLength(0);
  });
  test('returns single match', () => {
    expect(logic.filterPlayersByPosition(players, 'CF')).toHaveLength(1);
  });
});

// ── starsDisplay ───────────────────────────────────────────────────────────
describe('starsDisplay', () => {
  test('returns "No ratings" for null', () => {
    expect(logic.starsDisplay(null)).toBe('No ratings');
  });
  test('returns "No ratings" for undefined', () => {
    expect(logic.starsDisplay(undefined)).toBe('No ratings');
  });
  test('shows 5 full stars for average of 5', () => {
    expect(logic.starsDisplay(5)).toContain('★★★★★');
  });
  test('shows 3 full stars and 2 empty for average of 3', () => {
    const result = logic.starsDisplay(3);
    expect(result).toContain('★★★');
    expect(result).toContain('☆☆');
  });
  test('includes numeric average in output', () => {
    expect(logic.starsDisplay(4.5)).toContain('4.5');
  });
});

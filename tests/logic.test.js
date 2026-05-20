const logic = require('../src/logic');

// ── validatePlayerName ─────────────────────────────────────────────────────
describe('validatePlayerName', () => {
  test('returns null for a valid name', () => {
    expect(logic.validatePlayerName('Mohamed Salah')).toBeNull();
  });
  test('rejects empty string', () => {
    expect(logic.validatePlayerName('')).not.toBeNull();
  });
  test('rejects name over 100 characters', () => {
    expect(logic.validatePlayerName('a'.repeat(101))).not.toBeNull();
  });
});

// ── validateTeam ───────────────────────────────────────────────────────────
describe('validateTeam', () => {
  test('returns null for a valid team', () => {
    expect(logic.validateTeam('Liverpool FC')).toBeNull();
  });
  test('rejects empty string', () => {
    expect(logic.validateTeam('')).not.toBeNull();
  });
  test('rejects team over 100 characters', () => {
    expect(logic.validateTeam('a'.repeat(101))).not.toBeNull();
  });
});

// ── validatePosition ───────────────────────────────────────────────────────
describe('validatePosition', () => {
  test('returns null for valid position CB', () => {
    expect(logic.validatePosition('CB')).toBeNull();
  });
  test('rejects invalid position', () => {
    expect(logic.validatePosition('GK')).not.toBeNull();
  });
  test('rejects null', () => {
    expect(logic.validatePosition(null)).not.toBeNull();
  });
});

// ── validateRating ─────────────────────────────────────────────────────────
describe('validateRating', () => {
  test('returns null for rating 5', () => {
    expect(logic.validateRating(5)).toBeNull();
  });
  test('rejects rating 0', () => {
    expect(logic.validateRating(0)).not.toBeNull();
  });
  test('rejects rating 6', () => {
    expect(logic.validateRating(6)).not.toBeNull();
  });
});

// ── validateNonNegativeInt ─────────────────────────────────────────────────
describe('validateNonNegativeInt', () => {
  test('returns null for 0', () => {
    expect(logic.validateNonNegativeInt(0, 'Minutes played')).toBeNull();
  });
  test('rejects negative number', () => {
    expect(logic.validateNonNegativeInt(-1, 'Minutes played')).not.toBeNull();
  });
  test('rejects float', () => {
    expect(logic.validateNonNegativeInt(1.5, 'Minutes played')).not.toBeNull();
  });
});

// ── validateCards ──────────────────────────────────────────────────────────
describe('validateCards', () => {
  test('returns null for None', () => {
    expect(logic.validateCards('None')).toBeNull();
  });
  test('returns null for Yellow', () => {
    expect(logic.validateCards('Yellow')).toBeNull();
  });
  test('rejects invalid card value', () => {
    expect(logic.validateCards('Blue')).not.toBeNull();
  });
});

// ── computeAverageRating ───────────────────────────────────────────────────
describe('computeAverageRating', () => {
  test('returns null for empty array', () => {
    expect(logic.computeAverageRating([])).toBeNull();
  });
  test('returns correct average for multiple reports', () => {
    expect(logic.computeAverageRating([{ rating: 4 }, { rating: 2 }])).toBe(3);
  });
  test('rounds to one decimal place', () => {
    expect(logic.computeAverageRating([{ rating: 4 }, { rating: 3 }])).toBe(3.5);
  });
});

// ── filterPlayersByPosition ────────────────────────────────────────────────
describe('filterPlayersByPosition', () => {
  const players = [
    { id: 1, name: 'A', position: 'CB' },
    { id: 2, name: 'B', position: 'CF' },
    { id: 3, name: 'C', position: 'CB' },
  ];

  test('returns all players when position is empty', () => {
    expect(logic.filterPlayersByPosition(players, '')).toHaveLength(3);
  });
  test('filters by CB correctly', () => {
    expect(logic.filterPlayersByPosition(players, 'CB')).toHaveLength(2);
  });
  test('returns empty array when no match', () => {
    expect(logic.filterPlayersByPosition(players, 'WIDE')).toHaveLength(0);
  });
});

// ── starsDisplay ───────────────────────────────────────────────────────────
describe('starsDisplay', () => {
  test('returns "No ratings" for null', () => {
    expect(logic.starsDisplay(null)).toBe('No ratings');
  });
  test('shows 5 full stars for rating 5', () => {
    expect(logic.starsDisplay(5)).toContain('★★★★★');
  });
  test('includes numeric average in output', () => {
    expect(logic.starsDisplay(4)).toContain('4');
  });
});

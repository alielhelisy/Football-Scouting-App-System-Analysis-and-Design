const logic = require('../src/logic');

test('validatePlayerName returns null for a valid name', () => {
  expect(logic.validatePlayerName('Mohamed Salah')).toBeNull();
});

test('validatePlayerName rejects empty string', () => {
  expect(logic.validatePlayerName('')).not.toBeNull();
});

test('validateTeam returns null for a valid team', () => {
  expect(logic.validateTeam('Liverpool FC')).toBeNull();
});

test('validateTeam rejects empty string', () => {
  expect(logic.validateTeam('')).not.toBeNull();
});

test('validatePosition returns null for valid position CB', () => {
  expect(logic.validatePosition('CB')).toBeNull();
});

test('validatePosition rejects invalid position', () => {
  expect(logic.validatePosition('GK')).not.toBeNull();
});

test('validateRating returns null for rating 3', () => {
  expect(logic.validateRating(3)).toBeNull();
});

test('validateRating rejects rating 0', () => {
  expect(logic.validateRating(0)).not.toBeNull();
});

test('computeAverageRating returns correct average', () => {
  expect(logic.computeAverageRating([{ rating: 4 }, { rating: 2 }])).toBe(3);
});

test('computeAverageRating returns null for empty array', () => {
  expect(logic.computeAverageRating([])).toBeNull();
});

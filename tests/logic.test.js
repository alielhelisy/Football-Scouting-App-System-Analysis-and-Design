const logic = require('../src/logic');

test('validatePlayerName returns null for a valid name', () => {
  expect(logic.validatePlayerName('Mohamed Salah')).toBeNull();
});

test('validatePlayerName rejects empty string', () => {
  expect(logic.validatePlayerName('')).not.toBeNull();
});

test('validatePlayerName rejects null', () => {
  expect(logic.validatePlayerName(null)).not.toBeNull();
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

test('validatePosition rejects null', () => {
  expect(logic.validatePosition(null)).not.toBeNull();
});

test('validateRating returns null for rating 3', () => {
  expect(logic.validateRating(3)).toBeNull();
});

test('validateRating rejects rating 0', () => {
  expect(logic.validateRating(0)).not.toBeNull();
});

test('validateRating rejects rating 6', () => {
  expect(logic.validateRating(6)).not.toBeNull();
});

test('validateNonNegativeInt returns null for 0', () => {
  expect(logic.validateNonNegativeInt(0, 'Minutes played')).toBeNull();
});

test('validateNonNegativeInt rejects negative number', () => {
  expect(logic.validateNonNegativeInt(-1, 'Minutes played')).not.toBeNull();
});

test('validateCards returns null for None', () => {
  expect(logic.validateCards('None')).toBeNull();
});

test('validateCards returns null for Yellow', () => {
  expect(logic.validateCards('Yellow')).toBeNull();
});

test('validateCards rejects invalid card value', () => {
  expect(logic.validateCards('Blue')).not.toBeNull();
});

test('computeAverageRating returns correct average', () => {
  expect(logic.computeAverageRating([{ rating: 4 }, { rating: 2 }])).toBe(3);
});

test('computeAverageRating returns null for empty array', () => {
  expect(logic.computeAverageRating([])).toBeNull();
});

test('filterPlayersByPosition returns all players when position is empty', () => {
  const players = [{ id: 1, position: 'CB' }, { id: 2, position: 'CF' }];
  expect(logic.filterPlayersByPosition(players, '')).toHaveLength(2);
});

test('filterPlayersByPosition filters by position correctly', () => {
  const players = [{ id: 1, position: 'CB' }, { id: 2, position: 'CF' }];
  expect(logic.filterPlayersByPosition(players, 'CB')).toHaveLength(1);
});

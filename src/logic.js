const VALID_POSITIONS = ['CB', 'FB', '6ER', '8ER', 'WIDE', 'CF'];
const VALID_CARDS = ['None', 'Yellow', 'Red'];

function validatePlayerName(name) {
  if (!name || typeof name !== 'string') return 'Name is required';
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Name cannot be empty';
  if (trimmed.length > 100) return 'Name must be 100 characters or less';
  return null;
}

function validateTeam(team) {
  if (!team || typeof team !== 'string') return 'Team is required';
  const trimmed = team.trim();
  if (trimmed.length === 0) return 'Team cannot be empty';
  if (trimmed.length > 100) return 'Team must be 100 characters or less';
  return null;
}

function validatePosition(position) {
  if (!position) return 'Position is required';
  if (!VALID_POSITIONS.includes(position)) {
    return `Position must be one of: ${VALID_POSITIONS.join(', ')}`;
  }
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5';
  }
  return null;
}

function validateNonNegativeInt(value, fieldName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) {
    return `${fieldName} must be a non-negative integer`;
  }
  return null;
}

function validateCards(cards) {
  if (!VALID_CARDS.includes(cards)) {
    return `Cards must be one of: ${VALID_CARDS.join(', ')}`;
  }
  return null;
}

function computeAverageRating(reports) {
  if (!reports || reports.length === 0) return null;
  const sum = reports.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reports.length) * 10) / 10;
}

function filterPlayersByPosition(players, position) {
  if (!position) return players;
  return players.filter(p => p.position === position);
}

function starsDisplay(average) {
  if (average === null || average === undefined) return 'No ratings';
  const full = Math.round(average);
  return '★'.repeat(full) + '☆'.repeat(5 - full) + ` (${average})`;
}

module.exports = {
  VALID_POSITIONS,
  VALID_CARDS,
  validatePlayerName,
  validateTeam,
  validatePosition,
  validateRating,
  validateNonNegativeInt,
  validateCards,
  computeAverageRating,
  filterPlayersByPosition,
  starsDisplay,
};

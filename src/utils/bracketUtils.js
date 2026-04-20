export const CARD_WIDTH = 132;
export const CARD_HEIGHT = 48;
export const COLUMN_GAP = 156;
export const ROW_GAP = 72;

export const isPowerOfTwo = (value) => value > 0 && (value & (value - 1)) === 0;

export const generateTeams = (count) =>
  Array.from({ length: count }, (_, index) => `Team ${index + 1}`);

export const createInitialSelections = (teamsPerSide) => {
  const rounds = [];
  let matchCount = teamsPerSide / 2;

  while (matchCount >= 1) {
    rounds.push(Array(matchCount).fill(null));
    matchCount /= 2;
  }

  return rounds;
};

export const cloneSelectionRounds = (selectionRounds) =>
  selectionRounds.map((round) => [...round]);

export const buildRounds = (teams, selectionRounds) => {
  const rounds = [teams.map((team) => ({ label: team, variant: 'team' }))];

  while (rounds[rounds.length - 1].length > 1) {
    const previousRound = rounds[rounds.length - 1];
    const roundIndex = rounds.length - 1;
    const nextRound = [];

    for (let index = 0; index < previousRound.length; index += 2) {
      const topTeam = previousRound[index]?.label;
      const bottomTeam = previousRound[index + 1]?.label;
      const selectedTeam = selectionRounds[roundIndex]?.[index / 2];
      const winnerLabel =
        selectedTeam === 0
          ? topTeam
          : selectedTeam === 1
            ? bottomTeam
            : 'Winner';

      nextRound.push({ label: winnerLabel, variant: 'winner' });
    }

    rounds.push(nextRound);
  }

  return rounds;
};

export const getCenterY = (roundIndex, itemIndex) => {
  const slotSize = ROW_GAP * 2 ** roundIndex;
  return itemIndex * slotSize + slotSize / 2;
};

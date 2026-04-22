import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BracketSide from '../component/BracketSide';
import TournamentHeader from '../component/TournamentHeader';
import {
  buildRounds,
  cloneSelectionRounds,
  createInitialSelections,
  generateTeams,
  isPowerOfTwo,
} from '../utils/bracketUtils';

export default function TournamentScreen() {
  const [teamCount, setTeamCount] = useState(2);
  const [activeCount, setActiveCount] = useState(2);
  const [leftTeams, setLeftTeams] = useState(() => ['']);
  const [rightTeams, setRightTeams] = useState(() => ['']);
  const [leftSelections, setLeftSelections] = useState(() => createInitialSelections(1));
  const [rightSelections, setRightSelections] = useState(() => createInitialSelections(1));
  const [finalWinner, setFinalWinner] = useState('Winner');
  const [winnerPrompt, setWinnerPrompt] = useState(null);

  const teamOptions = useMemo(() => generateTeams(activeCount), [activeCount]);
  const selectedTeams = useMemo(
    () => [...leftTeams, ...rightTeams].filter(Boolean),
    [leftTeams, rightTeams]
  );

  useEffect(() => {
    const freshTeams = generateTeams(activeCount);
    const midPoint = Math.ceil(freshTeams.length / 2);
    const freshLeftTeams = Array(midPoint).fill('');
    const freshRightTeams = Array(midPoint).fill('');
    const freshSelections = createInitialSelections(midPoint);

    setLeftTeams(freshLeftTeams);
    setRightTeams(freshRightTeams);
    setLeftSelections(freshSelections);
    setRightSelections(cloneSelectionRounds(freshSelections));
    setFinalWinner('Winner');
  }, [activeCount]);

  const leftRounds = useMemo(
    () => buildRounds(leftTeams, leftSelections),
    [leftSelections, leftTeams]
  );
  const rightRounds = useMemo(
    () => buildRounds(rightTeams, rightSelections),
    [rightSelections, rightTeams]
  );

  const leftFinalist = leftRounds[leftRounds.length - 1]?.[0]?.label ?? 'Winner';
  const rightFinalist = rightRounds[rightRounds.length - 1]?.[0]?.label ?? 'Winner';

  const applyWinnerSelection = (
    selectionRounds,
    roundIndex,
    matchIndex,
    winnerIndex
  ) => {
    const updated = cloneSelectionRounds(selectionRounds);
    updated[roundIndex][matchIndex] = winnerIndex;

    for (let index = roundIndex + 1; index < updated.length; index += 1) {
      updated[index] = updated[index].map(() => null);
    }

    return updated;
  };

  const commitWinnerSelection = (
    side,
    roundIndex,
    matchIndex,
    winnerIndex,
    winnerName
  ) => {
    if (side === 'left') {
      setLeftSelections((previous) =>
        applyWinnerSelection(previous, roundIndex, matchIndex, winnerIndex)
      );
    } else if (side === 'right') {
      setRightSelections((previous) =>
        applyWinnerSelection(previous, roundIndex, matchIndex, winnerIndex)
      );
    } else {
      setFinalWinner(winnerName);
    }

    setWinnerPrompt(null);
    Alert.alert('Winner selected', `${winnerName} advances.`);
  };

  const handleSelectWinner = (
    side,
    roundIndex,
    matchIndex,
    topTeam,
    bottomTeam
  ) => {
    if (topTeam === 'Winner' || bottomTeam === 'Winner') {
      Alert.alert(
        'Select earlier match first',
        'Pick winners in earlier rounds before this point.'
      );
      return;
    }

    setWinnerPrompt({
      side,
      roundIndex,
      matchIndex,
      topTeam,
      bottomTeam,
    });
  };

  const handleStart = () => {
    const parsed = Number.parseInt(teamCount, 10);

    if (!Number.isFinite(parsed) || parsed < 2) {
      Alert.alert('Invalid teams', 'Enter a valid number of teams (minimum 2).');
      return;
    }

    if (parsed % 2 !== 0) {
      Alert.alert('Invalid teams', 'Enter a power of 2: 2, 4, 8, 16, ...');
      return;
    }

    if (!isPowerOfTwo(parsed)) {
      Alert.alert('Invalid teams', 'Enter a power of 2: 2, 4, 8, 16, ...');
      return;
    }

    setActiveCount(parsed);
  };

  const handleTeamChange = (side, teamIndex, value) => {
    const updateSideTeams = (previous, targetIndex) => {
      const updated = previous.map((team, index) => {
        if (index === targetIndex) {
          return value;
        }

        return team === value ? '' : team;
      });

      return updated;
    };

    if (side === 'left') {
      setLeftTeams((previous) => updateSideTeams(previous, teamIndex));
      setRightTeams((previous) => previous.map((team) => (team === value ? '' : team)));
      return;
    }

    setRightTeams((previous) => updateSideTeams(previous, teamIndex));
    setLeftTeams((previous) => previous.map((team) => (team === value ? '' : team)));
  };

  const handleSelectFinalWinner = () => {
    handleSelectWinner('final', 0, 0, leftFinalist, rightFinalist);
  };

  const hasFinalWinner = finalWinner !== 'Winner';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <TournamentHeader
            teamCount={teamCount}
            setTeamCount={setTeamCount}
            onRenderBracket={handleStart}
          />
        </View>

        <View style={styles.bracketShell}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bracketScroll}
          >
            <View style={styles.bracketCanvas}>
              <BracketSide
                teams={leftTeams}
                teamOptions={teamOptions}
                selectedTeams={selectedTeams}
                selections={leftSelections}
                onTeamChange={(teamIndex, value) => handleTeamChange('left', teamIndex, value)}
                onSelectWinner={(roundIndex, matchIndex, topTeam, bottomTeam) =>
                  handleSelectWinner(
                    'left',
                    roundIndex,
                    matchIndex,
                    topTeam,
                    bottomTeam
                  )
                }
              />

              <View style={styles.centerRail}>
                <View style={styles.centerLine} />
                <Pressable
                  style={({ pressed }) => [
                    styles.centerOrb,
                    hasFinalWinner && styles.centerOrbChampion,
                    pressed && styles.centerOrbPressed,
                    leftFinalist !== 'Winner' && rightFinalist !== 'Winner' &&
                      styles.centerOrbInteractive,
                  ]}
                  onPress={handleSelectFinalWinner}
                >
                  <Text style={styles.centerOrbText}>{leftFinalist}</Text>
                  <Text style={styles.centerOrbVs}>VS</Text>
                  <Text style={styles.centerOrbText}>{rightFinalist}</Text>
                  <View
                    style={[
                      styles.centerWinnerTag,
                      hasFinalWinner
                        ? styles.centerWinnerTagActive
                        : styles.centerWinnerTagIdle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.centerWinnerTagText,
                        hasFinalWinner
                          ? styles.centerWinnerTagTextActive
                          : styles.centerWinnerTagTextIdle,
                      ]}
                    >
                      Champion
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.centerOrbWinner,
                      hasFinalWinner ? styles.centerOrbWinnerActive : styles.centerOrbWinnerIdle,
                    ]}
                  >
                    {finalWinner}
                  </Text>
                </Pressable>
              </View>

              <BracketSide
                teams={rightTeams}
                teamOptions={teamOptions}
                selectedTeams={selectedTeams}
                selections={rightSelections}
                onTeamChange={(teamIndex, value) => handleTeamChange('right', teamIndex, value)}
                mirror
                onSelectWinner={(roundIndex, matchIndex, topTeam, bottomTeam) =>
                  handleSelectWinner(
                    'right',
                    roundIndex,
                    matchIndex,
                    topTeam,
                    bottomTeam
                  )
                }
              />
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(winnerPrompt)}
        transparent
        animationType="fade"
        onRequestClose={() => setWinnerPrompt(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose winner</Text>
            <Text style={styles.modalSubtitle}>
              Select the team that won this match.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.modalOption,
                pressed && styles.modalOptionPressed,
              ]}
              onPress={() =>
                commitWinnerSelection(
                  winnerPrompt.side,
                  winnerPrompt.roundIndex,
                  winnerPrompt.matchIndex,
                  0,
                  winnerPrompt.topTeam
                )
              }
            >
              <Text style={styles.modalOptionText}>{winnerPrompt?.topTeam}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modalOption,
                pressed && styles.modalOptionPressed,
              ]}
              onPress={() =>
                commitWinnerSelection(
                  winnerPrompt.side,
                  winnerPrompt.roundIndex,
                  winnerPrompt.matchIndex,
                  1,
                  winnerPrompt.bottomTeam
                )
              }
            >
              <Text style={styles.modalOptionText}>{winnerPrompt?.bottomTeam}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modalCancel,
                pressed && styles.modalCancelPressed,
              ]}
              onPress={() => setWinnerPrompt(null)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#4c5059',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 28,
  },
  headerCard: {
    marginBottom: 16,
  },
  bracketShell: {
    borderRadius: 28,
    backgroundColor: '#eef2f7',
    borderWidth: 1,
    borderColor: '#d2dae4',
    minHeight: 560,
    overflow: 'hidden',
    marginTop: 4,
  },
  bracketScroll: {
    paddingHorizontal: 22,
    paddingVertical: 22,
    alignItems: 'center',
  },
  bracketCanvas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centerRail: {
    width: 206,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  centerLine: {
    position: 'absolute',
    left: 94,
    top: 90,
    bottom: 90,
    width: 2,
    backgroundColor: '#bdc8d4',
  },
  centerOrb: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: '#656b75',
    borderWidth: 1,
    borderColor: '#8c94a1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOrbInteractive: {
    borderColor: '#aab4c0',
  },
  centerOrbChampion: {
    borderColor: '#f7c948',
    backgroundColor: '#5b6069',
  },
  centerOrbPressed: {
    transform: [{ scale: 0.98 }],
  },
  centerOrbText: {
    color: '#f4f7fb',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    width: 122,
  },
  centerOrbVs: {
    marginTop: 4,
    marginBottom: 4,
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  centerOrbWinner: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    width: 122,
  },
  centerOrbWinnerIdle: {
    color: '#cfd8e3',
  },
  centerOrbWinnerActive: {
    color: '#ffe59a',
  },
  centerWinnerTag: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  centerWinnerTagIdle: {
    backgroundColor: 'rgba(207, 216, 227, 0.15)',
    borderColor: 'rgba(207, 216, 227, 0.4)',
  },
  centerWinnerTagActive: {
    backgroundColor: '#fde68a',
    borderColor: '#facc15',
  },
  centerWinnerTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  centerWinnerTagTextIdle: {
    color: '#dbe4ef',
  },
  centerWinnerTagTextActive: {
    color: '#4a3600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fbfdff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#d8e0ea',
    padding: 18,
  },
  modalTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#52525b',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 14,
  },
  modalOption: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cfd8e3',
    backgroundColor: '#f3f7fc',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  modalOptionPressed: {
    backgroundColor: '#e8f1fb',
    borderColor: '#9db8d6',
  },
  modalOptionText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '700',
  },
  modalCancel: {
    marginTop: 4,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelPressed: {
    opacity: 0.7,
  },
  modalCancelText: {
    color: '#516171',
    fontSize: 14,
    fontWeight: '700',
  },
});

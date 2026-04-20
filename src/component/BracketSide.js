import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import MatchCard from './MatchCard';
import {
  buildRounds,
  CARD_HEIGHT,
  CARD_WIDTH,
  COLUMN_GAP,
  getCenterY,
  ROW_GAP,
} from '../utils/bracketUtils';

const CONNECTOR_NEUTRAL = '#b9c4d0';
const CONNECTOR_WIN = '#22c55e';
const CONNECTOR_LOSE = '#ef4444';

export default function BracketSide({
  teams,
  selections,
  onSelectWinner,
  mirror = false,
}) {
  const rounds = useMemo(() => buildRounds(teams, selections), [teams, selections]);
  const roundCount = rounds.length;
  const sideHeight = rounds[0].length * ROW_GAP;
  const sideWidth = (roundCount - 1) * COLUMN_GAP + CARD_WIDTH;

  const columns = rounds.map((round, roundIndex) => {
    const columnIndex = mirror ? roundCount - 1 - roundIndex : roundIndex;
    const x = columnIndex * COLUMN_GAP;

    return {
      cards: round.map((item, itemIndex) => {
        const centerY = getCenterY(roundIndex, itemIndex);
        const top = centerY - CARD_HEIGHT / 2;

        return {
          key: `${mirror ? 'right' : 'left'}-${roundIndex}-${itemIndex}`,
          x,
          top,
          roundIndex,
          itemIndex,
          label: item.label,
          variant: item.variant,
        };
      }),
    };
  });

  const connectors = [];
  const matchPoints = [];

  for (let roundIndex = 1; roundIndex < roundCount; roundIndex += 1) {
    const parentRound = rounds[roundIndex];
    const childColumnIndex = mirror ? roundCount - roundIndex : roundIndex - 1;
    const parentColumnIndex = mirror ? roundCount - 1 - roundIndex : roundIndex;
    const childX = childColumnIndex * COLUMN_GAP;
    const parentX = parentColumnIndex * COLUMN_GAP;
    const lineX = mirror ? parentX + CARD_WIDTH + 16 : childX + CARD_WIDTH + 16;
    const childEdgeX = mirror ? childX : childX + CARD_WIDTH;
    const parentEdgeX = mirror ? parentX + CARD_WIDTH : parentX;

    parentRound.forEach((_, parentIndex) => {
      const firstChildCenter = getCenterY(roundIndex - 1, parentIndex * 2);
      const secondChildCenter = getCenterY(roundIndex - 1, parentIndex * 2 + 1);
      const parentCenter = getCenterY(roundIndex, parentIndex);
      const topTeam = rounds[roundIndex - 1][parentIndex * 2]?.label;
      const bottomTeam = rounds[roundIndex - 1][parentIndex * 2 + 1]?.label;
      const selectedTeam = selections[roundIndex - 1]?.[parentIndex];
      const winnerLabel =
        selectedTeam === 0 ? topTeam : selectedTeam === 1 ? bottomTeam : null;
      const topStroke =
        selectedTeam == null
          ? CONNECTOR_NEUTRAL
          : selectedTeam === 0
            ? CONNECTOR_WIN
            : CONNECTOR_LOSE;
      const bottomStroke =
        selectedTeam == null
          ? CONNECTOR_NEUTRAL
          : selectedTeam === 1
            ? CONNECTOR_WIN
            : CONNECTOR_LOSE;
      const headStroke = selectedTeam == null ? CONNECTOR_NEUTRAL : CONNECTOR_WIN;

      connectors.push(
        <Line
          key={`${mirror ? 'right' : 'left'}-${roundIndex}-${parentIndex}-top`}
          x1={childEdgeX}
          y1={firstChildCenter}
          x2={lineX}
          y2={firstChildCenter}
          stroke={topStroke}
          strokeWidth="2"
        />,
        <Line
          key={`${mirror ? 'right' : 'left'}-${roundIndex}-${parentIndex}-bottom`}
          x1={childEdgeX}
          y1={secondChildCenter}
          x2={lineX}
          y2={secondChildCenter}
          stroke={bottomStroke}
          strokeWidth="2"
        />,
        <Line
          key={`${mirror ? 'right' : 'left'}-${roundIndex}-${parentIndex}-trunk-top`}
          x1={lineX}
          y1={firstChildCenter}
          x2={lineX}
          y2={parentCenter}
          stroke={topStroke}
          strokeWidth="2"
        />,
        <Line
          key={`${mirror ? 'right' : 'left'}-${roundIndex}-${parentIndex}-trunk-bottom`}
          x1={lineX}
          y1={parentCenter}
          x2={lineX}
          y2={secondChildCenter}
          stroke={bottomStroke}
          strokeWidth="2"
        />,
        <Line
          key={`${mirror ? 'right' : 'left'}-${roundIndex}-${parentIndex}-head`}
          x1={lineX}
          y1={parentCenter}
          x2={parentEdgeX}
          y2={parentCenter}
          stroke={headStroke}
          strokeWidth="2"
        />
      );

      matchPoints.push({
        key: `${mirror ? 'right' : 'left'}-point-${roundIndex}-${parentIndex}`,
        x: lineX - 10,
        y: parentCenter - 10,
        roundIndex: roundIndex - 1,
        matchIndex: parentIndex,
        topTeam,
        bottomTeam,
        winnerLabel,
      });
    });
  }

  return (
    <View style={[styles.side, { width: sideWidth, height: sideHeight }]}>
      <Svg width={sideWidth} height={sideHeight} style={StyleSheet.absoluteFill}>
        {connectors}
      </Svg>

      {columns.map((column) =>
        column.cards.map((card) => (
          <View key={card.key} style={[styles.cardWrap, { left: card.x, top: card.top }]}>
            {(() => {
              const roundSelection = selections[card.roundIndex];
              const matchIndex = Math.floor(card.itemIndex / 2);
              const selectedTeam = roundSelection?.[matchIndex];
              let outcome = 'neutral';

              if (selectedTeam != null) {
                outcome = selectedTeam === card.itemIndex % 2 ? 'win' : 'lose';
              }

              return (
            <MatchCard
              label={card.label}
              variant={card.variant}
              align={mirror ? 'right' : 'left'}
              outcome={outcome}
            />
              );
            })()}
          </View>
        ))
      )}

      {matchPoints.map((point) => (
        <Pressable
          key={point.key}
          style={({ pressed }) => [
            styles.matchPoint,
            { left: point.x, top: point.y },
            point.winnerLabel ? styles.matchPointActive : styles.matchPointIdle,
            pressed && styles.matchPointPressed,
          ]}
          onPress={() =>
            onSelectWinner(point.roundIndex, point.matchIndex, point.topTeam, point.bottomTeam)
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  side: {
    position: 'relative',
  },
  cardWrap: {
    position: 'absolute',
  },
  matchPoint: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    zIndex: 3,
    shadowColor: '#1e293b',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  matchPointIdle: {
    backgroundColor: '#ffffff',
    borderColor: '#9fb0c1',
  },
  matchPointActive: {
    backgroundColor: '#2ccf67',
    borderColor: '#1b9b49',
  },
  matchPointPressed: {
    transform: [{ scale: 0.94 }],
  },
});

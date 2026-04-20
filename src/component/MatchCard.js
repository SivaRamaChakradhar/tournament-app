import { Text, View, StyleSheet } from 'react-native';

export default function MatchCard({
    label,
    variant = 'team',
    align = 'left',
    outcome = 'neutral',
}) {
    const isWinner = variant === 'winner';
    const isOutcomeWin = outcome === 'win';
    const isOutcomeLose = outcome === 'lose';

    return (
        <View
            style={[
                styles.card,
                isWinner ? styles.winnerCard : styles.teamCard,
                isOutcomeWin && styles.outcomeWinCard,
                isOutcomeLose && styles.outcomeLoseCard,
                align === 'right' && styles.alignRight,
            ]}
        >
            <View
                style={[
                    styles.badge,
                    isWinner ? styles.winnerBadge : styles.teamBadge,
                    isOutcomeWin && styles.outcomeWinBadge,
                    isOutcomeLose && styles.outcomeLoseBadge,
                ]}
            />
            <Text
                style={[
                    styles.label,
                    isWinner && styles.winnerLabel,
                    isOutcomeWin && styles.outcomeWinLabel,
                    isOutcomeLose && styles.outcomeLoseLabel,
                    align === 'right' && styles.labelRight,
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 136,
        height: 50,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#e2e9f1',
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 10,
        shadowColor: '#0f172a',
        shadowOpacity: 0.1,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    alignRight: {
        flexDirection: 'row-reverse',
    },
    teamCard: {
        borderColor: '#e2e8f0',
    },
    winnerCard: {
        borderColor: '#cfe7d6',
        backgroundColor: '#f4fbf6',
    },
    outcomeWinCard: {
        borderColor: '#71d79a',
        backgroundColor: '#edf9f1',
    },
    outcomeLoseCard: {
        borderColor: '#f4a7a7',
        backgroundColor: '#fff2f2',
    },
    badge: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    teamBadge: {
        backgroundColor: '#1d2458',
    },
    winnerBadge: {
        backgroundColor: '#28c55f',
    },
    outcomeWinBadge: {
        backgroundColor: '#22c55e',
    },
    outcomeLoseBadge: {
        backgroundColor: '#ef4444',
    },
    label: {
        color: '#202a39',
        fontSize: 13,
        fontWeight: '700',
        flexShrink: 1,
    },
    labelRight: {
        textAlign: 'right',
    },
    winnerLabel: {
        color: '#2f5f3e',
    },
    outcomeWinLabel: {
        color: '#146c43',
    },
    outcomeLoseLabel: {
        color: '#b42318',
    },
});
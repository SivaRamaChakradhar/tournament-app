import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function TournamentHeader({
  teamCount,
  setTeamCount,
  onRenderBracket,
}) {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.kicker}>Tournament Bracket</Text>
      <Text style={styles.title}>A cleaner knockout layout</Text>
      <Text style={styles.subtitle}>
        Tap any junction point between two teams to choose a winner and advance them.
      </Text>

      <View style={styles.controlsRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Teams</Text>
          <TextInput
            value={teamCount}
            onChangeText={setTeamCount}
            keyboardType="numeric"
            placeholder="Enter number of teams"
            placeholderTextColor="#8c95a1"
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={onRenderBracket}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Render bracket</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: '#f9fbfe',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d8e1eb',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  kicker: {
    color: '#5f6d7f',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 8,
    color: '#111827',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    color: '#566273',
    fontSize: 14,
    lineHeight: 21,
  },
  controlsRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: 7,
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#9aaabe',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#0f172a',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

import { Text, View } from "react-native";

interface StandingEntry {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  totalPoints: number;
  roundsWon: number;
  roundsParticipated: number;
  avgPointsPerRound: number;
}

interface LeagueStandingsTableProps {
  standings: StandingEntry[];
  currentUserId: string;
}

export function LeagueStandingsTable({
  standings,
  currentUserId,
}: LeagueStandingsTableProps) {
  if (standings.length === 0) {
    return (
      <View className="items-center py-6">
        <Text className="text-sm text-[#6b9b8a] italic">
          No standings yet. Complete a round to see rankings.
        </Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-2xl border border-[#0f3a2e] bg-[#071f1a]">
      {/* Header */}
      <View className="flex-row items-center border-b border-[#0f3a2e] px-4 py-3">
        <Text className="w-8 text-xs font-bold text-[#6b9b8a] uppercase">
          #
        </Text>
        <Text className="flex-1 text-xs font-bold text-[#6b9b8a] uppercase">
          Player
        </Text>
        <Text className="w-14 text-center text-xs font-bold text-[#6b9b8a] uppercase">
          Pts
        </Text>
        <Text className="w-14 text-center text-xs font-bold text-[#6b9b8a] uppercase">
          Wins
        </Text>
      </View>

      {/* Rows */}
      {standings.map((entry, index) => {
        const isCurrentUser = entry.user.id === currentUserId;
        const position = index + 1;

        return (
          <View
            key={entry.user.id}
            className={`flex-row items-center px-4 py-3 ${
              isCurrentUser ? "bg-[#10b981]/10" : ""
            } ${index < standings.length - 1 ? "border-b border-[#0f3a2e]/50" : ""}`}
          >
            {/* Position */}
            <View className="w-8">
              <Text
                className={`text-sm font-bold ${
                  position === 1
                    ? "text-[#FFD700]"
                    : position === 2
                      ? "text-[#C0C0C0]"
                      : position === 3
                        ? "text-[#CD7F32]"
                        : "text-[#6b9b8a]"
                }`}
              >
                {position}
              </Text>
            </View>

            {/* Player */}
            <View className="flex-1 flex-row items-center gap-2">
              <View
                className="items-center justify-center rounded-full bg-[#0f3a2e]"
                style={{ width: 28, height: 28 }}
              >
                <Text
                  className="text-xs font-bold text-[#e0f0eb]"
                  style={{ fontSize: 11 }}
                >
                  {(entry.user.name ?? "?").charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text
                className={`text-sm font-medium ${
                  isCurrentUser ? "text-[#10b981]" : "text-[#e0f0eb]"
                }`}
                numberOfLines={1}
              >
                {entry.user.name ?? "Unknown"}
                {isCurrentUser ? " (you)" : ""}
              </Text>
            </View>

            {/* Points */}
            <Text className="w-14 text-center text-sm font-bold text-[#e0f0eb]">
              {entry.totalPoints}
            </Text>

            {/* Wins */}
            <Text className="w-14 text-center text-sm font-medium text-[#6b9b8a]">
              {entry.roundsWon}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

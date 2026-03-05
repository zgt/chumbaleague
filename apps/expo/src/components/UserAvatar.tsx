import { Image, Text, View } from "react-native";

interface UserAvatarProps {
  name: string | null | undefined;
  image: string | null | undefined;
  size?: number;
}

export function UserAvatar({ name, image, size = 32 }: UserAvatarProps) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        accessibilityLabel={name ?? "User avatar"}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#164B49",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#DCE4E4",
          fontSize: size * 0.4,
          fontWeight: "700",
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

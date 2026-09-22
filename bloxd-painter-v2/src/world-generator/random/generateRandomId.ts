export function generateRandomId(length = 21): string {
  return crypto
    .getRandomValues(new Uint8Array(length))
    .reduce(
      (result, value) => {
        value &= 63;

        return result +=
          value < 36
            ? value.toString(36)
            : value < 62
              ? (value - 26).toString(36).toUpperCase()
              : value > 62
                ? "-"
                : "_";
      },
      ""
    );
}
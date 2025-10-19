export function getLetter(n: number): string {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("n must be a positive integer (1-based).");
  }

  let result = "";

  while (n > 0) {
    n--; // shift to 0-based
    const rem = n % 26;
    result = String.fromCharCode(65 + rem) + result; // 65 = 'A'
    n = Math.floor(n / 26);
  }

  return result;
}

export function getArr(len: number) {
  return [...Array(len).keys()];
}

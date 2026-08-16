export function formatJOD(amount: number) {
  return `${amount.toFixed(3)} د.أ`;
}

export function formatOrderNumber(id: string) {
  const value = Number.parseInt(id.replace(/[^a-fA-F0-9]/g, "").slice(0, 10) || "0", 16);
  return `#${String((value % 900000) + 100000)}`;
}

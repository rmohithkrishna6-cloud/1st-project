export function sanitizeOutput(text: string): string {
  if (!text) return "";
  // 1. Strip ANSI escape sequences (e.g. \u001b[32m color codes)
  const cleanAnsi = text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
  // 2. Normalize carriage returns (\r\n -> \n, standalone \r -> \n) and remove null bytes (\0)
  const normalized = cleanAnsi.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\0/g, "");
  return normalized;
}

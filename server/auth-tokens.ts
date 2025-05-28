// Global token store that persists across all requests
const activeTokens = new Map<string, { userId: number; createdAt: Date }>();

export function createToken(token: string, userId: number): void {
  activeTokens.set(token, { userId, createdAt: new Date() });
  console.log("Token created:", token.substring(0, 8) + "...");
  console.log("Active tokens count:", activeTokens.size);
}

export function validateToken(token: string): { userId: number } | null {
  console.log("Validating token:", token.substring(0, 8) + "...");
  console.log("Available tokens:", Array.from(activeTokens.keys()).map(t => t.substring(0, 8) + "..."));
  console.log("Active tokens count:", activeTokens.size);
  
  const tokenData = activeTokens.get(token);
  if (!tokenData) {
    console.log("Token not found in store");
    return null;
  }
  
  // Check if token is expired (24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (tokenData.createdAt < oneDayAgo) {
    activeTokens.delete(token);
    console.log("Token expired and removed");
    return null;
  }
  
  console.log("Token validated successfully");
  return { userId: tokenData.userId };
}

export function removeToken(token: string): void {
  activeTokens.delete(token);
  console.log("Token removed:", token.substring(0, 8) + "...");
}

export function getTokenCount(): number {
  return activeTokens.size;
}
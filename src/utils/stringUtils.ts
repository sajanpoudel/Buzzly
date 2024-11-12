export function getInitialsFromEmail(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/).filter(Boolean)
  if (parts.length === 0) {
    return ""
  }
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

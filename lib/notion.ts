export async function getNotionConnectionStatus(cookie: string | undefined) {
  if (!cookie) return false;

  const response = await fetch("http://localhost:8080/api/v1/users/me", {
    headers: { Cookie: cookie },
  });

  if (!response.ok) return false;

  const user = await response.json();
  return !!user.notionWorkspaceName;
}

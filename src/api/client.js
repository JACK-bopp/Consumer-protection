async function loadRuntimeConfig() {
  const response = await fetch('/runtime-config.json');
  if (!response.ok) {
    throw new Error('无法加载 runtime-config.json');
  }
  return response.json();
}

export async function checkApiStatus() {
  const config = await loadRuntimeConfig();
  const response = await fetch('/api/status', {
    headers: { 'x-api-base': config.apiBaseUrl },
  });
  const body = await response.json();
  return { status: response.status, body };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return res;
}

export async function login(username: string, password: string) {
  const res = await fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function logout() {
  const res = await fetchApi('/api/auth/logout', { method: 'POST' });
  return res.json();
}

export async function getMe() {
  const res = await fetchApi('/api/auth/me');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function getPolicies() {
  const res = await fetchApi('/api/policies');
  return res.json();
}

export async function getPolicy(id: number) {
  const res = await fetchApi(`/api/policies/${id}`);
  return res.json();
}

export async function createPolicy(data: Record<string, string>) {
  const res = await fetchApi('/api/policies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePolicy(id: number, data: Record<string, string>) {
  const res = await fetchApi(`/api/policies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePolicy(id: number) {
  const res = await fetchApi(`/api/policies/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function getNBContact(prefix: string) {
  const res = await fetchApi(`/api/policies/nb-contact?prefix=${encodeURIComponent(prefix)}`);
  return res.json();
}

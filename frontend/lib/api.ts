// frontend/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Accept optional search/filter params
export async function getPaginatedFaculties(
  page: number = 1,
  limit: number = 15,
  filters?: { search?: string; min_score?: number; max_score?: number }
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters?.search) params.append('search', filters.search);
  if (filters?.min_score !== undefined) params.append('min_score', filters.min_score.toString());
  if (filters?.max_score !== undefined) params.append('max_score', filters.max_score.toString());

  const res = await fetch(`${API_BASE}/faculties?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch faculties: ${res.status}`);
  return res.json();
}

export async function evaluateFaculty(faculty_id: number) {
  const res = await fetch(`${API_BASE}/evaluate/${faculty_id}`);
  if (!res.ok) throw new Error('Faculty not found');
  return res.json();
}

export async function getExplanation(faculty_id: number) {
  const res = await fetch(`${API_BASE}/explanation/${faculty_id}`);
  if (!res.ok) throw new Error('Explanation not found');
  return res.json();
}

export async function getAudit(faculty_id: number) {
  const res = await fetch(`${API_BASE}/audit/${faculty_id}`);
  if (!res.ok) throw new Error('Audit not found');
  return res.json();
}
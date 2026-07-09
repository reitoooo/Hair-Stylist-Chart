/**
 * API client for the FastAPI backend.
 * Provides typed methods for all API endpoints.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// ──── Questionnaire ────
export const questionnaireApi = {
  create: (data: import('../types').QuestionnaireData) =>
    request<import('../types').Questionnaire>('/questionnaire', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  get: (id: string) =>
    request<import('../types').Questionnaire>(`/questionnaire/${id}`),
  list: () =>
    request<import('../types').Questionnaire[]>('/questionnaires'),
};

// ──── Desired Styles ────
export const desiredStyleApi = {
  create: (data: import('../types').DesiredStyleCreate) =>
    request<import('../types').DesiredStyle>('/desired-style', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  get: (id: string) =>
    request<import('../types').DesiredStyle>(`/desired-style/${id}`),
};

// ──── Stylists ────
export const stylistApi = {
  list: (params?: { specialty?: string; brand?: string; location?: string; sort_by?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.specialty) searchParams.set('specialty', params.specialty);
    if (params?.brand) searchParams.set('brand', params.brand);
    if (params?.location) searchParams.set('location', params.location);
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    const qs = searchParams.toString();
    return request<import('../types').StylistProfile[]>(`/stylists${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) =>
    request<import('../types').StylistProfile>(`/stylists/${id}`),
  update: (id: string, data: import('../types').StylistProfileUpdate) =>
    request<import('../types').StylistProfile>(`/stylists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ──── Bookings ────
export const bookingApi = {
  create: (data: import('../types').BookingCreate) =>
    request<import('../types').Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  list: (role: 'user' | 'stylist' = 'user', status?: string) => {
    const searchParams = new URLSearchParams({ role });
    if (status) searchParams.set('status', status);
    return request<import('../types').Booking[]>(`/bookings?${searchParams}`);
  },
  get: (id: string) =>
    request<import('../types').Booking>(`/bookings/${id}`),
  updateStatus: (id: string, status: import('../types').BookingStatus) =>
    request<import('../types').Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ──── Recipes ────
export const recipeApi = {
  get: (bookingId: string) =>
    request<import('../types').AIRecipe>(`/recipes/${bookingId}`),
  regenerate: (bookingId: string) =>
    request<import('../types').AIRecipe>(`/recipes/${bookingId}/regenerate`, {
      method: 'POST',
    }),
};

// ──── Chat ────
export const chatApi = {
  getMessages: (bookingId: string) =>
    request<import('../types').ChatMessage[]>(`/chat/messages/${bookingId}`),
  sendMessage: (bookingId: string, content: string) =>
    request<import('../types').ChatMessage>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, content }),
    }),
};

// ──── Chemicals (Feature 4) ────
export const chemicalApi = {
  calculate: (data: import('../types').ChemicalCalculationRequest) =>
    request<import('../types').ChemicalCalculationResult>('/chemicals/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listAgents: (type?: string) => {
    const qs = type ? `?agent_type=${type}` : '';
    return request<import('../types').ChemicalAgent[]>(`/chemicals/agents${qs}`);
  },
};

// ──── SOAP Charts (Feature 5) ────
export const soapApi = {
  get: (bookingId: string) =>
    request<import('../types').SOAPChart>(`/soap/${bookingId}`),
  create: (data: { booking_id: string; stylist_id: string; subjective: string; objective: string; assessment: string; plan: string }) =>
    request<import('../types').SOAPChart>('/soap', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (chartId: string, data: import('../types').SOAPChartUpdate) =>
    request<import('../types').SOAPChart>(`/soap/${chartId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  generate: (bookingId: string) =>
    request<import('../types').SOAPChart>(`/soap/${bookingId}/generate`, {
      method: 'POST',
    }),
};

// ──── Allergy Checklists (Feature 6) ────
export const allergyApi = {
  create: (data: import('../types').AllergyChecklistData) =>
    request<import('../types').AllergyChecklist>('/allergy-checklist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  get: (questionnaireId: string) =>
    request<import('../types').AllergyChecklist>(`/allergy-checklist/${questionnaireId}`),
  list: () =>
    request<import('../types').AllergyChecklist[]>('/allergy-checklists'),
};

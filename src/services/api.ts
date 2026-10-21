import {
  Tenant,
  Service,
  Staff,
  BlockedSlot,
  Customer,
  Appointment,
  AppUser,
  TimeSlot,
  AppointmentStatus
} from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Tenants
  getTenants: () => request<Tenant[]>('/tenants'),
  getTenant: (idOrSlug: string) => request<Tenant>(`/tenants/${idOrSlug}`),
  createTenant: (data: Partial<Tenant>) =>
    request<Tenant>('/tenants', { method: 'POST', body: JSON.stringify(data) }),
  updateTenant: (id: string, data: Partial<Tenant>) =>
    request<Tenant>(`/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Services
  getServices: (tenantId: string, onlyActive = false) =>
    request<Service[]>(`/tenants/${tenantId}/services?active=${onlyActive}`),
  createService: (tenantId: string, data: Partial<Service>) =>
    request<Service>(`/tenants/${tenantId}/services`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateService: (tenantId: string, id: string, data: Partial<Service>) =>
    request<Service>(`/tenants/${tenantId}/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteService: (tenantId: string, id: string) =>
    request<{ success: boolean }>(`/tenants/${tenantId}/services/${id}`, { method: 'DELETE' }),

  // Staff
  getStaff: (tenantId: string, onlyActive = false) =>
    request<Staff[]>(`/tenants/${tenantId}/staff?active=${onlyActive}`),
  createStaff: (tenantId: string, data: Partial<Staff>) =>
    request<Staff>(`/tenants/${tenantId}/staff`, { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (tenantId: string, id: string, data: Partial<Staff>) =>
    request<Staff>(`/tenants/${tenantId}/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteStaff: (tenantId: string, id: string) =>
    request<{ success: boolean }>(`/tenants/${tenantId}/staff/${id}`, { method: 'DELETE' }),

  // Blocked slots
  getBlockedSlots: (tenantId: string, date?: string) =>
    request<BlockedSlot[]>(`/tenants/${tenantId}/blocked-slots${date ? `?date=${date}` : ''}`),
  createBlockedSlot: (tenantId: string, data: Partial<BlockedSlot>) =>
    request<BlockedSlot>(`/tenants/${tenantId}/blocked-slots`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteBlockedSlot: (tenantId: string, id: string) =>
    request<{ success: boolean }>(`/tenants/${tenantId}/blocked-slots/${id}`, {
      method: 'DELETE'
    }),

  // Customers
  getCustomers: (tenantId: string) => request<Customer[]>(`/tenants/${tenantId}/customers`),

  // Availability
  getAvailability: (tenantId: string, date: string, serviceId: string, staffId?: string) => {
    let url = `/tenants/${tenantId}/availability?date=${date}&serviceId=${serviceId}`;
    if (staffId && staffId !== 'any') url += `&staffId=${staffId}`;
    return request<TimeSlot[]>(url);
  },

  // Appointments
  getAppointments: (
    tenantId: string,
    filters?: {
      date?: string;
      status?: AppointmentStatus;
      staffId?: string;
      serviceId?: string;
      search?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.staffId) params.append('staffId', filters.staffId);
    if (filters?.serviceId) params.append('serviceId', filters.serviceId);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return request<Appointment[]>(`/tenants/${tenantId}/appointments${query ? `?${query}` : ''}`);
  },
  createAppointment: (tenantId: string, data: any) =>
    request<Appointment>(`/tenants/${tenantId}/appointments`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAppointmentStatus: (
    tenantId: string,
    id: string,
    status: AppointmentStatus,
    performedBy: string,
    notes?: string
  ) =>
    request<Appointment>(`/tenants/${tenantId}/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, performedBy, notes })
    }),
  rescheduleAppointment: (
    tenantId: string,
    id: string,
    newDate: string,
    newStartTime: string,
    performedBy: string,
    reason?: string
  ) =>
    request<Appointment>(`/tenants/${tenantId}/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ newDate, newStartTime, performedBy, reason })
    }),
  cancelAppointment: (tenantId: string, id: string, reason: string, performedBy: string) =>
    request<Appointment>(`/tenants/${tenantId}/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, performedBy })
    }),

  // Stats
  getStats: (tenantId: string) => request<any>(`/tenants/${tenantId}/stats`),

  // Users
  getUsers: () => request<AppUser[]>('/auth/users')
};

export type SectorType =
  | 'grooming'
  | 'barbershop'
  | 'veterinary'
  | 'health_dental'
  | 'beauty_spa'
  | 'therapy_psychology'
  | 'automotive'
  | 'tech_services'
  | 'consulting'
  | 'general';

export type UserRole = 'superadmin' | 'tenant_admin' | 'staff' | 'customer';

export type AppointmentStatus =
  | 'received'
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type ModalityType = 'presential' | 'home' | 'virtual';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DynamicField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
  placeholder?: string;
  required: boolean;
  options?: string[]; // for 'select'
  description?: string;
}

export interface DaySchedule {
  active: boolean;
  start: string; // e.g. "08:00"
  end: string;   // e.g. "18:00"
  breaks?: { start: string; end: string }[];
}

export type WeeklySchedule = Record<DayOfWeek, DaySchedule>;

export interface WhatsAppTemplates {
  onReceived: string;
  onConfirmed: string;
  onRescheduled: string;
  onCancelled: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  sector: SectorType;
  description: string;
  logo: string;
  banner?: string;
  primaryColor: string;
  accentColor: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  timezone: string;
  currency: string;
  autoConfirm: boolean;
  advanceMinHours: number;
  advanceMaxDays: number;
  cancelMinHours: number;
  slotIntervalMinutes: number;
  defaultSchedule: WeeklySchedule;
  bookingTerms: string;
  dataPolicyNotice: string;
  whatsappTemplates: WhatsAppTemplates;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  bufferMinutes: number; // preparation or cleaning
  modalities: ModalityType[];
  staffIds: string[]; // which staff can provide this
  dynamicFields: DynamicField[];
  active: boolean;
  order: number;
}

export interface Staff {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleTitle: string; // e.g. "Estilista Canino", "Barbero Master", "Odontólogo General"
  serviceIds: string[];
  schedule: WeeklySchedule;
  active: boolean;
}

export interface BlockedSlot {
  id: string;
  tenantId: string;
  staffId?: string; // if empty, blocks entire business
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  allDay: boolean;
  reason?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalBookings: number;
  lastBookingAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  serviceBuffer: number;
  staffId?: string;
  staffName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  timezone: string;
  modality: ModalityType;
  address?: string;
  customAnswers: Record<string, any>;
  status: AppointmentStatus;
  source: 'public_web' | 'manual_admin';
  internalNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  history: AuditLog[];
}

export interface AppUser {
  id: string;
  tenantId?: string;
  name: string;
  email: string;
  role: UserRole;
  staffId?: string;
}

export interface TimeSlot {
  time: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
  reason?: string;
  staffId?: string;
  staffName?: string;
}

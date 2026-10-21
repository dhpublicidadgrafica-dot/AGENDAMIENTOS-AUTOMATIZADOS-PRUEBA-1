import {
  Tenant,
  Service,
  Staff,
  BlockedSlot,
  Customer,
  Appointment,
  AppUser,
  TimeSlot,
  DayOfWeek,
  AppointmentStatus,
  WeeklySchedule
} from '../types';
import {
  initialTenants,
  initialServices,
  initialStaff,
  initialBlockedSlots,
  initialCustomers,
  initialAppointments,
  initialUsers
} from './initialData';

// Concurrency mutex lock map
const slotLocks = new Map<string, Promise<void>>();

async function acquireLock(lockKey: string): Promise<() => void> {
  while (slotLocks.has(lockKey)) {
    await slotLocks.get(lockKey);
  }
  let resolver: () => void;
  const promise = new Promise<void>((resolve) => {
    resolver = resolve;
  });
  slotLocks.set(lockKey, promise);
  return () => {
    slotLocks.delete(lockKey);
    resolver!();
  };
}

class StorageEngine {
  private tenants: Tenant[] = [...initialTenants];
  private services: Service[] = [...initialServices];
  private staff: Staff[] = [...initialStaff];
  private blockedSlots: BlockedSlot[] = [...initialBlockedSlots];
  private customers: Customer[] = [...initialCustomers];
  private appointments: Appointment[] = [...initialAppointments];
  private users: AppUser[] = [...initialUsers];

  // =================== TENANTS ===================
  getTenants(): Tenant[] {
    return this.tenants;
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.find((t) => t.id === id);
  }

  getTenantBySlug(slug: string): Tenant | undefined {
    return this.tenants.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
  }

  createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Tenant {
    const id = `tenant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTenant: Tenant = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tenants.push(newTenant);
    return newTenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant {
    const idx = this.tenants.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Empresa no encontrada');
    this.tenants[idx] = {
      ...this.tenants[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.tenants[idx];
  }

  // =================== USERS & AUTH ===================
  getUsers(): AppUser[] {
    return this.users;
  }

  getUserById(id: string): AppUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  // =================== SERVICES ===================
  getServices(tenantId: string, onlyActive = false): Service[] {
    return this.services
      .filter((s) => s.tenantId === tenantId && (!onlyActive || s.active))
      .sort((a, b) => a.order - b.order);
  }

  getServiceById(id: string): Service | undefined {
    return this.services.find((s) => s.id === id);
  }

  createService(serviceData: Omit<Service, 'id'>): Service {
    const id = `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newService: Service = { ...serviceData, id };
    this.services.push(newService);
    return newService;
  }

  updateService(id: string, updates: Partial<Service>): Service {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Servicio no encontrado');
    this.services[idx] = { ...this.services[idx], ...updates };
    return this.services[idx];
  }

  deleteService(id: string): boolean {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.services.splice(idx, 1);
    return true;
  }

  // =================== STAFF ===================
  getStaff(tenantId: string, onlyActive = false): Staff[] {
    return this.staff.filter((st) => st.tenantId === tenantId && (!onlyActive || st.active));
  }

  getStaffById(id: string): Staff | undefined {
    return this.staff.find((st) => st.id === id);
  }

  createStaff(staffData: Omit<Staff, 'id'>): Staff {
    const id = `staff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newStaff: Staff = { ...staffData, id };
    this.staff.push(newStaff);
    return newStaff;
  }

  updateStaff(id: string, updates: Partial<Staff>): Staff {
    const idx = this.staff.findIndex((st) => st.id === id);
    if (idx === -1) throw new Error('Empleado no encontrado');
    this.staff[idx] = { ...this.staff[idx], ...updates };
    return this.staff[idx];
  }

  deleteStaff(id: string): boolean {
    const idx = this.staff.findIndex((st) => st.id === id);
    if (idx === -1) return false;
    this.staff.splice(idx, 1);
    return true;
  }

  // =================== BLOCKED SLOTS ===================
  getBlockedSlots(tenantId: string, date?: string): BlockedSlot[] {
    return this.blockedSlots.filter(
      (b) => b.tenantId === tenantId && (!date || b.date === date)
    );
  }

  createBlockedSlot(data: Omit<BlockedSlot, 'id'>): BlockedSlot {
    const id = `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBlocked: BlockedSlot = { ...data, id };
    this.blockedSlots.push(newBlocked);
    return newBlocked;
  }

  deleteBlockedSlot(id: string): boolean {
    const idx = this.blockedSlots.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.blockedSlots.splice(idx, 1);
    return true;
  }

  // =================== CUSTOMERS ===================
  getCustomers(tenantId: string): Customer[] {
    return this.customers.filter((c) => c.tenantId === tenantId);
  }

  getOrCreateCustomer(tenantId: string, name: string, phone: string, email?: string): Customer {
    let customer = this.customers.find((c) => c.tenantId === tenantId && c.phone === phone);
    if (customer) {
      customer.name = name;
      if (email) customer.email = email;
      customer.totalBookings += 1;
      customer.lastBookingAt = new Date().toISOString();
      return customer;
    }
    const newCust: Customer = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      name,
      phone,
      email,
      totalBookings: 1,
      lastBookingAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.customers.push(newCust);
    return newCust;
  }

  // =================== AVAILABILITY ENGINE ===================
  // Calculates available slots for a given date, tenant, service, and optional staff
  computeAvailableSlots(
    tenant: Tenant,
    service: Service,
    dateStr: string, // YYYY-MM-DD
    requestedStaffId?: string
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];

    // Parse day of week
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dateObj.getDay()];

    // 1. Advance time checks
    const now = new Date();
    const minAdvanceMs = tenant.advanceMinHours * 60 * 60 * 1000;
    const maxAdvanceMs = tenant.advanceMaxDays * 24 * 60 * 60 * 1000;
    const bookingDateMidnight = new Date(year, month - 1, day, 0, 0, 0);

    if (bookingDateMidnight.getTime() + 86400000 < now.getTime()) {
      return []; // Past date completely
    }

    if (bookingDateMidnight.getTime() > now.getTime() + maxAdvanceMs) {
      return []; // Beyond max advance booking horizon
    }

    // 2. Determine eligible staff
    const tenantStaff = this.getStaff(tenant.id, true).filter((st) =>
      service.staffIds.length === 0 || service.staffIds.includes(st.id)
    );

    let candidates = tenantStaff;
    if (requestedStaffId && requestedStaffId !== 'any') {
      candidates = tenantStaff.filter((st) => st.id === requestedStaffId);
    }

    if (candidates.length === 0 && tenantStaff.length > 0 && requestedStaffId && requestedStaffId !== 'any') {
      return []; // Requested staff not qualified for this service
    }

    // 3. Opening hours for the day
    const tenantDaySchedule = tenant.defaultSchedule[dayOfWeek];
    if (!tenantDaySchedule || !tenantDaySchedule.active) {
      return []; // Business closed this day
    }

    const intervalMinutes = tenant.slotIntervalMinutes || 30;
    const totalSlotDuration = service.durationMinutes + (service.bufferMinutes || 0);

    // Business bounds in minutes from midnight
    const [openH, openM] = tenantDaySchedule.start.split(':').map(Number);
    const [closeH, closeM] = tenantDaySchedule.end.split(':').map(Number);
    const openTotalMinutes = openH * 60 + openM;
    const closeTotalMinutes = closeH * 60 + closeM;

    // Fetch existing active appointments for the date
    const dayAppointments = this.appointments.filter(
      (a) =>
        a.tenantId === tenant.id &&
        a.date === dateStr &&
        a.status !== 'cancelled' &&
        a.status !== 'no_show'
    );

    // Fetch blocked slots for this date
    const dayBlocks = this.getBlockedSlots(tenant.id, dateStr);

    // Helper: convert HH:mm to minutes
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const toTimeStr = (totalMins: number) => {
      const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
      const m = (totalMins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    // Iterate through slots
    for (
      let currentMinute = openTotalMinutes;
      currentMinute + totalSlotDuration <= closeTotalMinutes;
      currentMinute += intervalMinutes
    ) {
      const slotStartTime = toTimeStr(currentMinute);
      const slotEndTime = toTimeStr(currentMinute + totalSlotDuration);

      // Check min advance from current time if booking is for today
      const slotDateTime = new Date(year, month - 1, day, Math.floor(currentMinute / 60), currentMinute % 60);
      if (slotDateTime.getTime() - now.getTime() < minAdvanceMs) {
        continue; // Too soon to book
      }

      // Check business lunch breaks
      const isBusinessBreak = (tenantDaySchedule.breaks || []).some((br) => {
        const brStart = toMinutes(br.start);
        const brEnd = toMinutes(br.end);
        return currentMinute < brEnd && currentMinute + totalSlotDuration > brStart;
      });
      if (isBusinessBreak) continue;

      // Check business-wide all-day or partial blocks
      const isBusinessBlocked = dayBlocks.some((b) => {
        if (b.staffId && b.staffId !== '') return false;
        if (b.allDay) return true;
        const bStart = toMinutes(b.startTime);
        const bEnd = toMinutes(b.endTime);
        return currentMinute < bEnd && currentMinute + totalSlotDuration > bStart;
      });
      if (isBusinessBlocked) continue;

      // Check if at least ONE candidate staff is free
      let availableStaffForSlot: Staff | undefined;

      if (candidates.length === 0) {
        // Business operates without named staff; check overall collision
        const hasCollision = dayAppointments.some((apt) => {
          const aptStart = toMinutes(apt.startTime);
          const aptEnd = toMinutes(apt.endTime) + apt.serviceBuffer;
          return currentMinute < aptEnd && currentMinute + totalSlotDuration > aptStart;
        });
        if (!hasCollision) {
          slots.push({
            time: slotStartTime,
            endTime: slotEndTime,
            available: true
          });
        }
      } else {
        // Find if any candidate staff is free
        for (const candidate of candidates) {
          const staffSchedule = candidate.schedule[dayOfWeek];
          if (!staffSchedule || !staffSchedule.active) continue;

          const staffStart = toMinutes(staffSchedule.start);
          const staffEnd = toMinutes(staffSchedule.end);
          if (currentMinute < staffStart || currentMinute + totalSlotDuration > staffEnd) {
            continue; // Outside staff shift
          }

          const isStaffBreak = (staffSchedule.breaks || []).some((br) => {
            const brStart = toMinutes(br.start);
            const brEnd = toMinutes(br.end);
            return currentMinute < brEnd && currentMinute + totalSlotDuration > brStart;
          });
          if (isStaffBreak) continue;

          // Check staff-specific blocks
          const isStaffBlocked = dayBlocks.some((b) => {
            if (b.staffId !== candidate.id) return false;
            if (b.allDay) return true;
            const bStart = toMinutes(b.startTime);
            const bEnd = toMinutes(b.endTime);
            return currentMinute < bEnd && currentMinute + totalSlotDuration > bStart;
          });
          if (isStaffBlocked) continue;

          // Check staff existing appointments
          const hasStaffConflict = dayAppointments.some((apt) => {
            if (apt.staffId && apt.staffId !== candidate.id) return false;
            const aptStart = toMinutes(apt.startTime);
            const aptEnd = toMinutes(apt.endTime) + (apt.serviceBuffer || 0);
            return currentMinute < aptEnd && currentMinute + totalSlotDuration > aptStart;
          });
          if (hasStaffConflict) continue;

          availableStaffForSlot = candidate;
          break; // Found at least one available staff member!
        }

        if (availableStaffForSlot) {
          slots.push({
            time: slotStartTime,
            endTime: slotEndTime,
            available: true,
            staffId: availableStaffForSlot.id,
            staffName: availableStaffForSlot.name
          });
        }
      }
    }

    return slots;
  }

  // =================== ATOMIC BOOKING WITH MUTEX ===================
  async createAppointmentAtomic(data: {
    tenantId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    staffId?: string;
    date: string;
    startTime: string;
    modality: 'presential' | 'home' | 'virtual';
    address?: string;
    customAnswers: Record<string, any>;
    source: 'public_web' | 'manual_admin';
    internalNotes?: string;
  }): Promise<Appointment> {
    const tenant = this.getTenantById(data.tenantId);
    if (!tenant) throw new Error('Empresa no existe o está inactiva');
    if (tenant.status !== 'active') throw new Error('Esta empresa se encuentra suspendida temporalmente');

    const service = this.getServiceById(data.serviceId);
    if (!service || service.tenantId !== tenant.id) {
      throw new Error('Servicio no válido o no pertenece a la empresa');
    }

    // Lock key encompasses tenant + date + time + (staff or general)
    const lockKey = `${tenant.id}_${data.date}_${data.startTime}_${data.staffId || 'general'}`;
    const releaseLock = await acquireLock(lockKey);

    try {
      // Re-verify availability atomically inside critical section!
      const availableSlots = this.computeAvailableSlots(tenant, service, data.date, data.staffId);
      const isSlotAvailable = availableSlots.some((s) => s.time === data.startTime && s.available);

      if (!isSlotAvailable) {
        throw new Error(
          'El horario seleccionado ya no está disponible o acaba de ser reservado por otro cliente. Por favor elige otro horario.'
        );
      }

      // Calculate endTime based on service duration
      const [h, m] = data.startTime.split(':').map(Number);
      const totalStartMins = h * 60 + m;
      const totalEndMins = totalStartMins + service.durationMinutes;
      const endH = Math.floor(totalEndMins / 60).toString().padStart(2, '0');
      const endM = (totalEndMins % 60).toString().padStart(2, '0');
      const endTime = `${endH}:${endM}`;

      // Staff assignment
      let assignedStaff = data.staffId ? this.getStaffById(data.staffId) : undefined;
      if (!assignedStaff) {
        // Auto assign first available staff from the slot
        const matchingSlot = availableSlots.find((s) => s.time === data.startTime);
        if (matchingSlot && matchingSlot.staffId) {
          assignedStaff = this.getStaffById(matchingSlot.staffId);
        }
      }

      // Unique booking code
      const prefix = tenant.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'RES');
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const bookingCode = `${prefix}-${randomCode}`;

      // Status determination: autoConfirm vs manual approval
      const initialStatus: AppointmentStatus = tenant.autoConfirm ? 'confirmed' : 'received';

      // Update customer CRM
      this.getOrCreateCustomer(tenant.id, data.customerName, data.customerPhone, data.customerEmail);

      const newAppointment: Appointment = {
        id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tenantId: tenant.id,
        bookingCode,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.durationMinutes,
        serviceBuffer: service.bufferMinutes || 0,
        staffId: assignedStaff?.id,
        staffName: assignedStaff?.name,
        date: data.date,
        startTime: data.startTime,
        endTime,
        timezone: tenant.timezone,
        modality: data.modality,
        address: data.address,
        customAnswers: data.customAnswers || {},
        status: initialStatus,
        source: data.source,
        internalNotes: data.internalNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action:
              data.source === 'public_web'
                ? `Reserva creada vía página web pública (${initialStatus === 'confirmed' ? 'Confirmada automáticamente' : 'Pendiente de confirmación'})`
                : `Cita ingresada manualmente por el panel de administración`,
            performedBy: data.source === 'public_web' ? data.customerName : 'Administrador',
            details: `Servicio: ${service.name} | Código: ${bookingCode}`
          }
        ]
      };

      this.appointments.push(newAppointment);
      return newAppointment;
    } finally {
      releaseLock();
    }
  }

  // =================== APPOINTMENTS MANAGEMENT ===================
  getAppointments(
    tenantId: string,
    filters?: {
      date?: string;
      status?: AppointmentStatus;
      staffId?: string;
      serviceId?: string;
      search?: string;
    }
  ): Appointment[] {
    return this.appointments
      .filter((a) => {
        if (a.tenantId !== tenantId) return false;
        if (filters?.date && a.date !== filters.date) return false;
        if (filters?.status && a.status !== filters.status) return false;
        if (filters?.staffId && a.staffId !== filters.staffId) return false;
        if (filters?.serviceId && a.serviceId !== filters.serviceId) return false;
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          const matchCode = a.bookingCode.toLowerCase().includes(s);
          const matchName = a.customerName.toLowerCase().includes(s);
          const matchPhone = a.customerPhone.includes(s);
          if (!matchCode && !matchName && !matchPhone) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by date then startTime
        const dComp = b.date.localeCompare(a.date);
        if (dComp !== 0) return dComp;
        return b.startTime.localeCompare(a.startTime);
      });
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.find((a) => a.id === id);
  }

  updateAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus,
    performedBy: string,
    notes?: string
  ): Appointment {
    const apt = this.getAppointmentById(id);
    if (!apt) throw new Error('Cita no encontrada');

    const prevStatus = apt.status;
    apt.status = newStatus;
    apt.updatedAt = new Date().toISOString();
    if (notes) {
      apt.internalNotes = apt.internalNotes ? `${apt.internalNotes}\n[${new Date().toLocaleTimeString()}]: ${notes}` : notes;
    }

    apt.history.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Cambio de estado: ${prevStatus} ➔ ${newStatus}`,
      performedBy,
      details: notes
    });

    return apt;
  }

  rescheduleAppointment(
    id: string,
    newDate: string,
    newStartTime: string,
    performedBy: string,
    reason?: string
  ): Appointment {
    const apt = this.getAppointmentById(id);
    if (!apt) throw new Error('Cita no encontrada');
    const tenant = this.getTenantById(apt.tenantId);
    if (!tenant) throw new Error('Empresa no encontrada');

    // Create a temporary mock service to verify availability for new date/time
    const service: Service = {
      id: apt.serviceId,
      tenantId: apt.tenantId,
      name: apt.serviceName,
      category: '',
      description: '',
      price: apt.servicePrice,
      durationMinutes: apt.serviceDuration,
      bufferMinutes: apt.serviceBuffer,
      modalities: [apt.modality],
      staffIds: apt.staffId ? [apt.staffId] : [],
      dynamicFields: [],
      active: true,
      order: 0
    };

    // Check availability
    const available = this.computeAvailableSlots(tenant, service, newDate, apt.staffId);
    const isValid = available.some((s) => s.time === newStartTime && s.available);
    if (!isValid) {
      throw new Error('El nuevo horario seleccionado no está disponible');
    }

    // Calculate new endTime
    const [h, m] = newStartTime.split(':').map(Number);
    const totalStartMins = h * 60 + m;
    const totalEndMins = totalStartMins + apt.serviceDuration;
    const endH = Math.floor(totalEndMins / 60).toString().padStart(2, '0');
    const endM = (totalEndMins % 60).toString().padStart(2, '0');

    const oldDate = apt.date;
    const oldTime = apt.startTime;

    apt.date = newDate;
    apt.startTime = newStartTime;
    apt.endTime = `${endH}:${endM}`;
    apt.updatedAt = new Date().toISOString();

    apt.history.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Reprogramación de cita de ${oldDate} ${oldTime} a ${newDate} ${newStartTime}`,
      performedBy,
      details: reason || 'Reprogramado por el usuario'
    });

    return apt;
  }

  cancelAppointment(id: string, reason: string, performedBy: string): Appointment {
    const apt = this.getAppointmentById(id);
    if (!apt) throw new Error('Cita no encontrada');

    apt.status = 'cancelled';
    apt.cancellationReason = reason;
    apt.updatedAt = new Date().toISOString();

    apt.history.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Cita cancelada. Motivo: ${reason}`,
      performedBy,
      details: reason
    });

    return apt;
  }

  // =================== METRICS & REPORTS ===================
  getTenantStats(tenantId: string) {
    const today = new Date().toISOString().split('T')[0];
    const tenantApts = this.appointments.filter((a) => a.tenantId === tenantId);

    const todayApts = tenantApts.filter((a) => a.date === today && a.status !== 'cancelled');
    const pending = tenantApts.filter((a) => a.status === 'pending' || a.status === 'received');
    const confirmed = tenantApts.filter((a) => a.status === 'confirmed');
    const completed = tenantApts.filter((a) => a.status === 'completed');
    const cancelled = tenantApts.filter((a) => a.status === 'cancelled');

    // Revenue projection
    const completedRevenue = completed.reduce((sum, a) => sum + (a.servicePrice || 0), 0);
    const confirmedProjectedRevenue = confirmed.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

    // Service distribution
    const serviceCounts: Record<string, { count: number; name: string; revenue: number }> = {};
    tenantApts.forEach((a) => {
      if (a.status === 'cancelled') return;
      if (!serviceCounts[a.serviceId]) {
        serviceCounts[a.serviceId] = { count: 0, name: a.serviceName, revenue: 0 };
      }
      serviceCounts[a.serviceId].count += 1;
      serviceCounts[a.serviceId].revenue += a.servicePrice || 0;
    });

    const popularServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count);

    return {
      todayCount: todayApts.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      totalCount: tenantApts.length,
      completedRevenue,
      confirmedProjectedRevenue,
      popularServices,
      upcomingToday: todayApts.slice(0, 5)
    };
  }
}

export const dbStore = new StorageEngine();

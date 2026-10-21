import { Router, Request, Response } from 'express';
import { dbStore } from './storage';

export const apiRouter = Router();

// =================== TENANTS ===================
apiRouter.get('/tenants', (req: Request, res: Response) => {
  try {
    const tenants = dbStore.getTenants();
    res.json(tenants);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/tenants/:identifier', (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let tenant = dbStore.getTenantById(identifier);
    if (!tenant) {
      tenant = dbStore.getTenantBySlug(identifier);
    }
    if (!tenant) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    res.json(tenant);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tenants', (req: Request, res: Response) => {
  try {
    const created = dbStore.createTenant(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/tenants/:id', (req: Request, res: Response) => {
  try {
    const updated = dbStore.updateTenant(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// =================== SERVICES ===================
apiRouter.get('/tenants/:tenantId/services', (req: Request, res: Response) => {
  try {
    const onlyActive = req.query.active === 'true';
    const services = dbStore.getServices(req.params.tenantId, onlyActive);
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tenants/:tenantId/services', (req: Request, res: Response) => {
  try {
    const created = dbStore.createService({ ...req.body, tenantId: req.params.tenantId });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/tenants/:tenantId/services/:id', (req: Request, res: Response) => {
  try {
    const updated = dbStore.updateService(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/tenants/:tenantId/services/:id', (req: Request, res: Response) => {
  try {
    const ok = dbStore.deleteService(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// =================== STAFF ===================
apiRouter.get('/tenants/:tenantId/staff', (req: Request, res: Response) => {
  try {
    const onlyActive = req.query.active === 'true';
    const staff = dbStore.getStaff(req.params.tenantId, onlyActive);
    res.json(staff);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tenants/:tenantId/staff', (req: Request, res: Response) => {
  try {
    const created = dbStore.createStaff({ ...req.body, tenantId: req.params.tenantId });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/tenants/:tenantId/staff/:id', (req: Request, res: Response) => {
  try {
    const updated = dbStore.updateStaff(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/tenants/:tenantId/staff/:id', (req: Request, res: Response) => {
  try {
    const ok = dbStore.deleteStaff(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// =================== BLOCKED SLOTS ===================
apiRouter.get('/tenants/:tenantId/blocked-slots', (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const slots = dbStore.getBlockedSlots(req.params.tenantId, date);
    res.json(slots);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tenants/:tenantId/blocked-slots', (req: Request, res: Response) => {
  try {
    const created = dbStore.createBlockedSlot({ ...req.body, tenantId: req.params.tenantId });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/tenants/:tenantId/blocked-slots/:id', (req: Request, res: Response) => {
  try {
    const ok = dbStore.deleteBlockedSlot(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// =================== CUSTOMERS ===================
apiRouter.get('/tenants/:tenantId/customers', (req: Request, res: Response) => {
  try {
    const customers = dbStore.getCustomers(req.params.tenantId);
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== AVAILABILITY ===================
apiRouter.get('/tenants/:tenantId/availability', (req: Request, res: Response) => {
  try {
    const { date, serviceId, staffId } = req.query as {
      date: string;
      serviceId: string;
      staffId?: string;
    };

    if (!date || !serviceId) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: date y serviceId' });
    }

    const tenant = dbStore.getTenantById(req.params.tenantId);
    if (!tenant) return res.status(404).json({ error: 'Empresa no encontrada' });

    const service = dbStore.getServiceById(serviceId);
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });

    const slots = dbStore.computeAvailableSlots(tenant, service, date, staffId);
    res.json(slots);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== APPOINTMENTS ===================
apiRouter.get('/tenants/:tenantId/appointments', (req: Request, res: Response) => {
  try {
    const { date, status, staffId, serviceId, search } = req.query as any;
    const list = dbStore.getAppointments(req.params.tenantId, {
      date,
      status,
      staffId,
      serviceId,
      search
    });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tenants/:tenantId/appointments', async (req: Request, res: Response) => {
  try {
    const appointment = await dbStore.createAppointmentAtomic({
      ...req.body,
      tenantId: req.params.tenantId
    });
    res.status(201).json(appointment);
  } catch (err: any) {
    // Return 409 Conflict if slot is taken / race condition
    const isConflict =
      err.message.includes('ya no está disponible') || err.message.includes('conflicto');
    res.status(isConflict ? 409 : 400).json({ error: err.message });
  }
});

apiRouter.patch('/tenants/:tenantId/appointments/:id/status', (req: Request, res: Response) => {
  try {
    const { status, performedBy, notes } = req.body;
    const updated = dbStore.updateAppointmentStatus(
      req.params.id,
      status,
      performedBy || 'Administrador',
      notes
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/tenants/:tenantId/appointments/:id/reschedule', (req: Request, res: Response) => {
  try {
    const { newDate, newStartTime, performedBy, reason } = req.body;
    const updated = dbStore.rescheduleAppointment(
      req.params.id,
      newDate,
      newStartTime,
      performedBy || 'Administrador',
      reason
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/tenants/:tenantId/appointments/:id/cancel', (req: Request, res: Response) => {
  try {
    const { reason, performedBy } = req.body;
    const updated = dbStore.cancelAppointment(
      req.params.id,
      reason || 'Cancelación solicitada',
      performedBy || 'Administrador'
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// =================== STATS ===================
apiRouter.get('/tenants/:tenantId/stats', (req: Request, res: Response) => {
  try {
    const stats = dbStore.getTenantStats(req.params.tenantId);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== USERS / AUTH ===================
apiRouter.get('/auth/users', (req: Request, res: Response) => {
  try {
    const users = dbStore.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

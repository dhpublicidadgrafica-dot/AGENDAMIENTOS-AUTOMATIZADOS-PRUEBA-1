import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Appointment, AppointmentStatus, Staff, Service } from '../../types';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { NewAppointmentModal } from './NewAppointmentModal';
import { buildWhatsAppLink, formatWhatsAppMessage } from '../../services/whatsapp';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  MessageSquare,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const { currentTenant, currentUser, showToast } = useApp();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openNewModal, setOpenNewModal] = useState<boolean>(false);

  const loadAppointments = async () => {
    if (!currentTenant) return;
    setLoading(true);
    try {
      const [apts, servs, staffs] = await Promise.all([
        api.getAppointments(currentTenant.id, {
          status: statusFilter !== 'all' ? (statusFilter as AppointmentStatus) : undefined,
          staffId: staffFilter !== 'all' ? staffFilter : undefined,
          serviceId: serviceFilter !== 'all' ? serviceFilter : undefined,
          date: dateFilter || undefined,
          search: search || undefined
        }),
        api.getServices(currentTenant.id),
        api.getStaff(currentTenant.id)
      ]);
      setAppointments(apts);
      setServices(servs);
      setStaffList(staffs);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [currentTenant, statusFilter, staffFilter, serviceFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAppointments();
  };

  const statusBadges: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
    received: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Recibida' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
    confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmada' },
    in_progress: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'En Proceso' },
    completed: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completada' },
    cancelled: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelada' },
    no_show: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'No Asistió' }
  };

  return (
    <div className="space-y-4">
      {/* Header and Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Gestión de Citas y Reservas</h2>
            <p className="text-xs text-slate-500">
              Control centralizado de citas, estados y comunicación con clientes
            </p>
          </div>
          <button
            onClick={() => setOpenNewModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Cita Manual</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente, teléfono o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            />
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="received">Solicitud Recibida</option>
            <option value="pending">Pendiente de Confirmación</option>
            <option value="confirmed">Confirmada</option>
            <option value="in_progress">En Proceso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No Asistió</option>
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-pointer"
          >
            <option value="all">Todos los Profesionales</option>
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-pointer"
          >
            <option value="all">Todos los Servicios</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="flex items-center space-x-1">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1"
                title="Limpiar fecha"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Cargando citas...</div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">No se encontraron citas con los filtros actuales</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Prueba cambiando los filtros o crea una nueva cita manual.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Código / Cliente</th>
                  <th className="py-3 px-4">Servicio & Valor</th>
                  <th className="py-3 px-4">Fecha & Horario</th>
                  <th className="py-3 px-4">Profesional</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {appointments.map((apt) => {
                  const badge = statusBadges[apt.status] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    label: apt.status
                  };

                  const waText = formatWhatsAppMessage(
                    currentTenant?.whatsappTemplates.onConfirmed || '',
                    apt,
                    currentTenant!
                  );
                  const waUrl = buildWhatsAppLink(apt.customerPhone, waText);

                  return (
                    <tr
                      key={apt.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {apt.bookingCode}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 mt-0.5">{apt.customerName}</p>
                        <p className="text-[11px] text-slate-400">{apt.customerPhone}</p>
                      </td>

                      {/* Service & Price */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{apt.serviceName}</p>
                        <p className="text-[11px] font-semibold text-slate-600">
                          ${(apt.servicePrice || 0).toLocaleString()} {currentTenant?.currency} •{' '}
                          {apt.serviceDuration} min
                        </p>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{apt.date}</p>
                        <p className="text-[11px] text-slate-500">
                          {apt.startTime} - {apt.endTime}
                        </p>
                      </td>

                      {/* Staff */}
                      <td className="py-3.5 px-4 text-slate-700">
                        {apt.staffName || <span className="text-slate-400 italic">No asignado</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Contactar por WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Ver detalles completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          isOpen={!!selectedAppointment}
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdated={loadAppointments}
        />
      )}

      {/* New Appointment Modal */}
      {openNewModal && (
        <NewAppointmentModal
          isOpen={openNewModal}
          onClose={() => setOpenNewModal(false)}
          onSuccess={loadAppointments}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Appointment, Staff } from '../../types';
import { AppointmentDetailModal } from '../appointments/AppointmentDetailModal';
import { NewAppointmentModal } from '../appointments/NewAppointmentModal';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Clock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { currentTenant } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'list'>('week');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openNewAppointmentModal, setOpenNewAppointmentModal] = useState<boolean>(false);
  const [selectedDateForNew, setSelectedDateForNew] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadCalendarData = async () => {
    if (!currentTenant) return;
    setLoading(true);
    try {
      const [apts, staffs] = await Promise.all([
        api.getAppointments(currentTenant.id, {
          staffId: selectedStaffId !== 'all' ? selectedStaffId : undefined
        }),
        api.getStaff(currentTenant.id)
      ]);
      setAppointments(apts);
      setStaffList(staffs);
    } catch (err) {
      console.error('Error loading calendar appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentTenant, selectedStaffId]);

  // Date navigation helpers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to format date strings YYYY-MM-DD
  const formatIso = (d: Date) => d.toISOString().split('T')[0];

  // Helper to get week days
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const day = curr.getDay(); // 0 is Sunday
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(curr.setDate(diff));

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      days.push(next);
    }
    return days;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'pending':
      case 'received':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'in_progress':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'completed':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200 line-through';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Top Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Navigation & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm font-bold text-slate-900 capitalize">
            {currentDate.toLocaleDateString('es-CO', {
              month: 'long',
              year: 'numeric'
            })}
          </h2>
        </div>

        {/* View Mode & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="text-xs bg-transparent border-0 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los Profesionales</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['day', 'week', 'month', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : mode === 'month' ? 'Mes' : 'Lista'}
              </button>
            ))}
          </div>

          {/* New Appointment button */}
          <button
            onClick={() => {
              setSelectedDateForNew(formatIso(currentDate));
              setOpenNewAppointmentModal(true);
            }}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Calendar Body */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs">
            {getWeekDays().map((d, i) => {
              const isToday = formatIso(d) === formatIso(new Date());
              return (
                <div key={i} className={`py-2.5 px-1 border-r last:border-r-0 border-slate-200 ${isToday ? 'bg-sky-50/70' : ''}`}>
                  <p className="font-semibold text-slate-500 uppercase text-[10px]">
                    {d.toLocaleDateString('es-CO', { weekday: 'short' })}
                  </p>
                  <p className={`text-sm font-extrabold mt-0.5 ${isToday ? 'text-sky-600' : 'text-slate-800'}`}>
                    {d.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Weekday columns */}
          <div className="grid grid-cols-7 min-h-[500px] divide-x divide-slate-200">
            {getWeekDays().map((dayDate, dayIdx) => {
              const dateStr = formatIso(dayDate);
              const dayApts = appointments.filter((a) => a.date === dateStr);

              return (
                <div
                  key={dayIdx}
                  className="p-1.5 space-y-1.5 hover:bg-slate-50/50 transition-colors"
                  onDoubleClick={() => {
                    setSelectedDateForNew(dateStr);
                    setOpenNewAppointmentModal(true);
                  }}
                >
                  {dayApts.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer shadow-2xs hover:shadow-xs transition-all ${statusColor(
                        apt.status
                      )}`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>{apt.startTime}</span>
                        <span className="font-mono text-[9px]">{apt.bookingCode}</span>
                      </div>
                      <p className="font-semibold truncate text-[11px] leading-tight mt-0.5">
                        {apt.customerName}
                      </p>
                      <p className="text-[10px] truncate opacity-80">{apt.serviceName}</p>
                      {apt.staffName && (
                        <p className="text-[9px] truncate opacity-70 mt-0.5">👤 {apt.staffName}</p>
                      )}
                    </div>
                  ))}

                  {dayApts.length === 0 && (
                    <button
                      onClick={() => {
                        setSelectedDateForNew(dateStr);
                        setOpenNewAppointmentModal(true);
                      }}
                      className="w-full h-16 border border-dashed border-transparent hover:border-slate-300 rounded-lg flex items-center justify-center text-[11px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all opacity-0 hover:opacity-100"
                    >
                      + Agendar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Agenda del{' '}
              {currentDate.toLocaleDateString('es-CO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h3>
          </div>

          {appointments.filter((a) => a.date === formatIso(currentDate)).length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">No hay citas para este día.</p>
              <button
                onClick={() => {
                  setSelectedDateForNew(formatIso(currentDate));
                  setOpenNewAppointmentModal(true);
                }}
                className="mt-3 px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg font-medium"
              >
                Crear Cita
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments
                .filter((a) => a.date === formatIso(currentDate))
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer hover:shadow-xs transition-all ${statusColor(
                      apt.status
                    )}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center font-bold text-xs">
                        <p>{apt.startTime}</p>
                        <p className="text-[10px] opacity-75">{apt.endTime}</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs">{apt.customerName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/60 rounded">
                            {apt.bookingCode}
                          </span>
                        </div>
                        <p className="text-xs">{apt.serviceName}</p>
                        <p className="text-[11px] opacity-80">
                          {apt.staffName ? `Atiende: ${apt.staffName}` : 'Sin profesional asignado'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase">{apt.status}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-3">
            Selecciona un día para ver o crear reservas:
          </p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
              <div key={i} className="py-1 text-[11px] font-bold text-slate-500">
                {d}
              </div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const count = appointments.filter((a) => a.date === dateStr).length;

              return (
                <div
                  key={i}
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setDate(dayNum);
                    setCurrentDate(d);
                    setViewMode('day');
                  }}
                  className="h-20 border border-slate-200 hover:border-sky-400 p-1.5 rounded-lg flex flex-col justify-between cursor-pointer hover:bg-sky-50/40 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700 text-left">{dayNum}</span>
                  {count > 0 && (
                    <span className="text-[10px] bg-sky-600 text-white font-bold py-0.5 px-1.5 rounded-full self-center">
                      {count} {count === 1 ? 'cita' : 'citas'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Lista Completa de Citas</h3>
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => setSelectedAppointment(apt)}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-900">{apt.customerName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{apt.bookingCode}</span>
                  </div>
                  <p className="text-xs text-slate-600">{apt.serviceName}</p>
                  <p className="text-[11px] text-slate-400">
                    {apt.date} • {apt.startTime} - {apt.endTime} • {apt.staffName || 'Sin asignar'}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusColor(
                    apt.status
                  )}`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          isOpen={!!selectedAppointment}
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdated={loadCalendarData}
        />
      )}

      {/* New Appointment Modal */}
      {openNewAppointmentModal && (
        <NewAppointmentModal
          isOpen={openNewAppointmentModal}
          onClose={() => setOpenNewAppointmentModal(false)}
          onSuccess={loadCalendarData}
          initialDate={selectedDateForNew}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { WeeklySchedule, DayOfWeek } from '../../types';
import { Clock, Save, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';

const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

export const AvailabilityView: React.FC = () => {
  const { currentTenant, refreshTenants, showToast } = useApp();

  const [schedule, setSchedule] = useState<WeeklySchedule>(currentTenant?.defaultSchedule || ({} as any));
  const [slotInterval, setSlotInterval] = useState<number>(currentTenant?.slotIntervalMinutes || 30);
  const [advanceMinHours, setAdvanceMinHours] = useState<number>(currentTenant?.advanceMinHours || 2);
  const [advanceMaxDays, setAdvanceMaxDays] = useState<number>(currentTenant?.advanceMaxDays || 30);
  const [cancelMinHours, setCancelMinHours] = useState<number>(currentTenant?.cancelMinHours || 6);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (currentTenant) {
      setSchedule(currentTenant.defaultSchedule);
      setSlotInterval(currentTenant.slotIntervalMinutes || 30);
      setAdvanceMinHours(currentTenant.advanceMinHours || 2);
      setAdvanceMaxDays(currentTenant.advanceMaxDays || 30);
      setCancelMinHours(currentTenant.cancelMinHours || 6);
    }
  }, [currentTenant]);

  if (!currentTenant) return null;

  const handleDayChange = (day: DayOfWeek, field: string, value: any) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateTenant(currentTenant.id, {
        defaultSchedule: schedule,
        slotIntervalMinutes: Number(slotInterval),
        advanceMinHours: Number(advanceMinHours),
        advanceMaxDays: Number(advanceMaxDays),
        cancelMinHours: Number(cancelMinHours)
      });
      showToast('Horarios y reglas de disponibilidad actualizados', 'success');
      refreshTenants();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar horarios', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Horarios de Atención y Disponibilidad</h2>
          <p className="text-xs text-slate-500">
            Define los días y franjas en que tu empresa está abierta al público para agendamiento
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Weekly Schedule Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Jornada Semanal de Atención</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {(Object.keys(dayLabels) as DayOfWeek[]).map((dayKey) => {
              const dayData = schedule[dayKey] || { active: false, start: '08:00', end: '18:00' };

              return (
                <div key={dayKey} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Day Toggle */}
                  <div className="w-32 flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      id={`day-${dayKey}`}
                      checked={dayData.active}
                      onChange={(e) => handleDayChange(dayKey, 'active', e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <label htmlFor={`day-${dayKey}`} className="font-semibold text-slate-800 cursor-pointer">
                      {dayLabels[dayKey]}
                    </label>
                  </div>

                  {/* Times */}
                  {dayData.active ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500">Apertura:</span>
                        <input
                          type="time"
                          value={dayData.start}
                          onChange={(e) => handleDayChange(dayKey, 'start', e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500">Cierre:</span>
                        <input
                          type="time"
                          value={dayData.end}
                          onChange={(e) => handleDayChange(dayKey, 'end', e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 rounded-md">
                        Abierto
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic font-medium px-2 py-1 bg-slate-50 rounded-md">
                      Cerrado todo el día
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Booking Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Reglas Globales de Reserva</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Intervalo entre Franjas (Minutos)
              </label>
              <select
                value={slotInterval}
                onChange={(e) => setSlotInterval(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value={15}>Cada 15 minutos</option>
                <option value={20}>Cada 20 minutos</option>
                <option value={30}>Cada 30 minutos (Recomendado)</option>
                <option value={45}>Cada 45 minutos</option>
                <option value={60}>Cada 60 minutos (1 hora)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Anticipación Mínima (Horas)
              </label>
              <input
                type="number"
                min={0}
                max={48}
                value={advanceMinHours}
                onChange={(e) => setAdvanceMinHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Tiempo mínimo que debe tener el cliente para agendar hoy
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Horizonte Máximo a Futuro (Días)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={advanceMaxDays}
                onChange={(e) => setAdvanceMaxDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Días permitidos visibles en el calendario
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tiempo Mínimo de Cancelación (Horas)
              </label>
              <input
                type="number"
                min={0}
                max={72}
                value={cancelMinHours}
                onChange={(e) => setCancelMinHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Plazo límite sin penalización configurado
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Horarios y Reglas'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

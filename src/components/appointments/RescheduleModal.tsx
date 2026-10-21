import React, { useState, useEffect } from 'react';
import { Appointment, TimeSlot } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { X, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RescheduleModalProps {
  isOpen: boolean;
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onSuccess
}) => {
  const { currentTenant, currentUser, showToast } = useApp();
  const [date, setDate] = useState<string>(appointment.date);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !currentTenant) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const available = await api.getAvailability(
          currentTenant.id,
          date,
          appointment.serviceId,
          appointment.staffId
        );
        setSlots(available);
        if (available.length > 0) {
          setSelectedTime(available[0].time);
        } else {
          setSelectedTime('');
        }
      } catch (err) {
        console.error('Error fetching slots for reschedule:', err);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [isOpen, date, currentTenant, appointment]);

  if (!isOpen || !currentTenant) return null;

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      showToast('Selecciona un horario disponible', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.rescheduleAppointment(
        currentTenant.id,
        appointment.id,
        date,
        selectedTime,
        currentUser.name,
        reason || 'Reprogramado por el administrador'
      );
      showToast('Cita reprogramada con éxito', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error al reprogramar la cita', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Reprogramar Cita {appointment.bookingCode}</h3>
            <p className="text-xs text-slate-300">Cliente: {appointment.customerName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReschedule} className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            Horario actual:{' '}
            <strong>
              {appointment.date} a las {appointment.startTime}
            </strong>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nueva Fecha
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Horarios Disponibles {loading && '(Buscando...)'}
            </label>
            {loading ? (
              <div className="text-xs text-slate-500 py-4 text-center animate-pulse">
                Comprobando disponibilidad del profesional...
              </div>
            ) : slots.length === 0 ? (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>No hay cupos disponibles en esta fecha. Selecciona otra fecha.</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    onClick={() => setSelectedTime(s.time)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                      selectedTime === s.time
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white hover:bg-sky-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo de Reprogramación
            </label>
            <input
              type="text"
              placeholder="Ej. Solicitud del cliente por cambio de turno"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !selectedTime || slots.length === 0}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-lg flex items-center space-x-1.5"
            >
              {saving ? <span>Guardando...</span> : <span>Confirmar Reprogramación</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

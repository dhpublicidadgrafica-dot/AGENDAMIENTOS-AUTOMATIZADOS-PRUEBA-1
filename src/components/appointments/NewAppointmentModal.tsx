import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Service, Staff, TimeSlot, ModalityType } from '../../types';
import { api } from '../../services/api';
import { X, Calendar, Clock, User, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate
}) => {
  const { currentTenant, currentUser, showToast } = useApp();

  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [modality, setModality] = useState<ModalityType>('presential');
  const [address, setAddress] = useState<string>('');

  // Customer details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!currentTenant || !isOpen) return;

    const loadData = async () => {
      try {
        const [servs, staffs] = await Promise.all([
          api.getServices(currentTenant.id, true),
          api.getStaff(currentTenant.id, true)
        ]);
        setServices(servs);
        setStaffList(staffs);
        if (servs.length > 0 && !selectedServiceId) {
          setSelectedServiceId(servs[0].id);
        }
      } catch (err) {
        console.error('Error loading modal data', err);
      }
    };
    loadData();
  }, [currentTenant, isOpen]);

  // Load available slots whenever date, service, or staff changes
  useEffect(() => {
    if (!currentTenant || !selectedServiceId || !date) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const slots = await api.getAvailability(
          currentTenant.id,
          date,
          selectedServiceId,
          selectedStaffId
        );
        setAvailableSlots(slots);
        if (slots.length > 0) {
          setSelectedTime(slots[0].time);
        } else {
          setSelectedTime('');
        }
      } catch (err: any) {
        console.error('Error fetching slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [currentTenant, selectedServiceId, selectedStaffId, date]);

  if (!isOpen || !currentTenant) return null;

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !selectedServiceId || !selectedTime) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createAppointment(currentTenant.id, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        serviceId: selectedServiceId,
        staffId: selectedStaffId !== 'any' ? selectedStaffId : undefined,
        date,
        startTime: selectedTime,
        modality,
        address: modality === 'home' ? address : undefined,
        customAnswers,
        source: 'manual_admin',
        internalNotes: internalNotes.trim() || undefined
      });

      showToast('Cita creada exitosamente', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error al crear la cita', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">Crear Cita Manual</h3>
            <p className="text-xs text-slate-300">
              Registrar cita para {currentTenant.name} (Recepción / Teléfono)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Customer info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Información del Cliente</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Teléfono / Celular *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. +57 300 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Service & Staff Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>2. Servicio y Profesional</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Servicio a Prestar *
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white cursor-pointer"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - ${s.price.toLocaleString()} ({s.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Profesional Asignado
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white cursor-pointer"
                >
                  <option value="any">Cualquier profesional disponible</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && selectedService.modalities.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Modalidad de Atención
                  </label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as ModalityType)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white cursor-pointer"
                  >
                    {selectedService.modalities.includes('presential') && (
                      <option value="presential">Presencial en sede</option>
                    )}
                    {selectedService.modalities.includes('home') && (
                      <option value="home">A Domicilio</option>
                    )}
                    {selectedService.modalities.includes('virtual') && (
                      <option value="virtual">Virtual / Online</option>
                    )}
                  </select>
                </div>
              )}

              {modality === 'home' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Dirección de Domicilio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Calle, número, conjunto o indicaciones"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Dynamic Sector Fields */}
            {selectedService && selectedService.dynamicFields && selectedService.dynamicFields.length > 0 && (
              <div className="pt-2 border-t border-slate-200 mt-2">
                <p className="text-[11px] font-semibold text-slate-600 mb-2">
                  Datos específicos del servicio ({currentTenant.sector}):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedService.dynamicFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                        {field.label} {field.required && '*'}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          required={field.required}
                          value={customAnswers[field.id] || ''}
                          onChange={(e) =>
                            setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                          }
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder={field.placeholder}
                          required={field.required}
                          value={customAnswers[field.id] || ''}
                          onChange={(e) =>
                            setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                          }
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date & Time Slot Picker */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>3. Fecha y Disponibilidad en Tiempo Real</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fecha de la Cita</label>
              <input
                type="date"
                required
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full md:w-56 text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Time Slot Grid */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Horario Disponible {loadingSlots && '(Comprobando agenda...)'}
              </label>

              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-slate-500 animate-pulse">
                  Verificando horarios y conflictos en backend...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    No hay cupos disponibles para esta fecha con el profesional o servicio seleccionado. Prueba otra fecha o profesional.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        type="button"
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : 'bg-white hover:bg-sky-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Internal notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Observaciones Internas
            </label>
            <textarea
              rows={2}
              placeholder="Notas para el equipo o recepcionista..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || availableSlots.length === 0 || !selectedTime}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center space-x-2"
            >
              {submitting ? (
                <span>Guardando reserva...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Crear Cita</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

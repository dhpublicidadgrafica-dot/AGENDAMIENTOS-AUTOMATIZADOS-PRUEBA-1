import React, { useState, useEffect } from 'react';
import { Tenant, Service, Staff, TimeSlot, ModalityType, Appointment } from '../../types';
import { api } from '../../services/api';
import { formatWhatsAppMessage, buildWhatsAppLink } from '../../services/whatsapp';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface PublicBookingPageProps {
  tenantSlug: string;
  onExitPreview?: () => void;
}

export const PublicBookingPage: React.FC<PublicBookingPageProps> = ({
  tenantSlug,
  onExitPreview
}) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Wizard Step (1 to 7)
  const [step, setStep] = useState<number>(1);

  // Step 1: Service
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Step 2: Customer info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');

  // Step 3: Dynamic Sector Questions
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  // Step 4: Staff & Modality
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [modality, setModality] = useState<ModalityType>('presential');
  const [address, setAddress] = useState<string>('');

  // Step 5: Date & Time Slots
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Step 6: Terms & Data policy acceptance
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [acceptedDataPolicy, setAcceptedDataPolicy] = useState<boolean>(false);

  // Step 7: Completed Appointment Result
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Load Tenant and active services
  useEffect(() => {
    const loadTenantData = async () => {
      setLoading(true);
      setError(null);
      try {
        const t = await api.getTenant(tenantSlug);
        setTenant(t);

        const [srvs, staffs] = await Promise.all([
          api.getServices(t.id, true),
          api.getStaff(t.id, true)
        ]);
        setServices(srvs);
        setStaffList(staffs);

        if (srvs.length > 0) {
          setSelectedService(srvs[0]);
          if (srvs[0].modalities && srvs[0].modalities.length > 0) {
            setModality(srvs[0].modalities[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'No pudimos encontrar esta empresa');
      } finally {
        setLoading(false);
      }
    };

    loadTenantData();
  }, [tenantSlug]);

  // Load available slots when at Step 5
  useEffect(() => {
    if (!tenant || !selectedService || !selectedDate || step !== 5) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const slots = await api.getAvailability(
          tenant.id,
          selectedDate,
          selectedService.id,
          selectedStaffId
        );
        setAvailableSlots(slots);
        if (slots.length > 0) {
          setSelectedTime(slots[0].time);
        } else {
          setSelectedTime('');
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [tenant, selectedService, selectedDate, selectedStaffId, step]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Cargando portal de reservas...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Empresa no encontrada</h2>
          <p className="text-xs text-slate-500">{error || 'El enlace de reserva no es válido o la empresa está inactiva.'}</p>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="mt-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Volver al Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle final appointment submission
  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const result = await api.createAppointment(tenant.id, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        serviceId: selectedService!.id,
        staffId: selectedStaffId !== 'any' ? selectedStaffId : undefined,
        date: selectedDate,
        startTime: selectedTime,
        modality,
        address: modality === 'home' ? address : undefined,
        customAnswers,
        source: 'public_web'
      });

      setCreatedAppointment(result);
      setStep(7); // Advance to completion receipt step
    } catch (err: any) {
      setSubmissionError(err.message || 'No fue posible registrar la cita. Por favor intenta otro horario.');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp formatted link for step 7
  let whatsappUrl = '#';
  let whatsappText = '';
  if (createdAppointment) {
    const tmpl =
      createdAppointment.status === 'confirmed'
        ? tenant.whatsappTemplates.onConfirmed
        : tenant.whatsappTemplates.onReceived;
    whatsappText = formatWhatsAppMessage(tmpl, createdAppointment, tenant);
    whatsappUrl = buildWhatsAppLink(tenant.whatsapp, whatsappText);
  }

  const assignedStaffMember = staffList.find((s) => s.id === selectedStaffId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Banner / Exit Preview button */}
      {onExitPreview && (
        <div className="bg-slate-900 text-white py-2 px-4 text-xs flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              Modo Vista Previa: Agendamiento público para <strong>{tenant.name}</strong>
            </span>
          </div>
          <button
            onClick={onExitPreview}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-200 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Volver al Dashboard</span>
          </button>
        </div>
      )}

      {/* Main Content Card Container */}
      <div className="max-w-2xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        {/* Business Branding Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
          {/* Banner */}
          {tenant.banner && (
            <div className="h-32 w-full overflow-hidden relative">
              <img
                src={tenant.banner}
                alt={tenant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          {/* Profile Header */}
          <div className="p-6 relative">
            <div className="flex items-center space-x-4">
              <img
                src={tenant.logo}
                alt={tenant.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md -mt-10 bg-white"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {tenant.name}
                </h1>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{tenant.description}</p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{tenant.address}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Box */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200/80 overflow-hidden flex flex-col">
          {/* Wizard Header Progress */}
          {step < 7 && (
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>
                  Paso {step} de 6:{' '}
                  {step === 1 && 'Selecciona tu Servicio'}
                  {step === 2 && 'Tus Datos de Contacto'}
                  {step === 3 && `Detalles para ${tenant.name}`}
                  {step === 4 && 'Profesional y Modalidad'}
                  {step === 5 && 'Fecha y Hora'}
                  {step === 6 && 'Confirmar Reserva'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {Math.round(((step - 1) / 5) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full transition-all duration-300"
                  style={{ width: `${((step - 1) / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Wizard Steps */}
          <div className="p-6 flex-1">
            {/* STEP 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">¿Qué servicio deseas agendar?</h3>
                  <p className="text-xs text-slate-500">
                    Selecciona uno de los servicios disponibles en nuestro catálogo:
                  </p>
                </div>

                <div className="space-y-3">
                  {services.map((srv) => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => {
                          setSelectedService(srv);
                          if (srv.modalities && srv.modalities.length > 0) {
                            setModality(srv.modalities[0]);
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900">{srv.name}</h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                                {srv.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{srv.description}</p>
                            <div className="flex items-center space-x-3 mt-2 text-xs">
                              <span className="flex items-center space-x-1 text-slate-600 font-medium">
                                <Clock className="w-3.5 h-3.5 text-sky-600" />
                                <span>{srv.durationMinutes} minutos</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-sm sm:text-base font-extrabold text-slate-900 block">
                              ${srv.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {tenant.currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Customer Contact Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Tus datos de contacto</h3>
                  <p className="text-xs text-slate-500">
                    Utilizaremos este número para enviarte la confirmación y recordatorio por WhatsApp.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Andrés Morales"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Teléfono Móvil / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 300 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="tuemail@ejemplo.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Dynamic Sector Questions */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Información adicional para {selectedService?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ayúdanos a prepararnos mejor para brindarte una excelente experiencia.
                  </p>
                </div>

                {selectedService?.dynamicFields && selectedService.dynamicFields.length > 0 ? (
                  <div className="space-y-3 text-xs">
                    {selectedService.dynamicFields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <label className="block font-semibold text-slate-700">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            required={field.required}
                            value={customAnswers[field.id] || ''}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                          >
                            <option value="">Selecciona una opción...</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            placeholder={field.placeholder}
                            value={customAnswers[field.id] || ''}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                          />
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            placeholder={field.placeholder}
                            required={field.required}
                            value={customAnswers[field.id] || ''}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    No se requieren datos adicionales para este servicio. Haz clic en siguiente.
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Staff & Modality */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Profesional y Modalidad</h3>
                  <p className="text-xs text-slate-500">
                    Elige con quién deseas atenderte y la modalidad de tu cita.
                  </p>
                </div>

                {/* Staff selection */}
                {staffList.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Profesional Preferido:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div
                        onClick={() => setSelectedStaffId('any')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedStaffId === 'any'
                            ? 'border-sky-600 bg-sky-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-bold text-slate-900">Cualquier Profesional</p>
                        <p className="text-[11px] text-slate-500">Mayor disponibilidad de horarios</p>
                      </div>

                      {staffList.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => setSelectedStaffId(st.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer flex items-center space-x-2.5 transition-all ${
                            selectedStaffId === st.id
                              ? 'border-sky-600 bg-sky-50/50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={
                              st.avatar ||
                              `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80`
                            }
                            alt={st.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate">{st.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{st.roleTitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modality selection */}
                {selectedService && selectedService.modalities.length > 1 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700">
                      Modalidad de Atención:
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedService.modalities.map((mod) => (
                        <button
                          type="button"
                          key={mod}
                          onClick={() => setModality(mod)}
                          className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                            modality === mod
                              ? 'border-sky-600 bg-sky-50 text-sky-800'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {mod === 'presential'
                            ? '🏢 Presencial en Sede'
                            : mod === 'home'
                            ? '🚗 A Domicilio'
                            : '💻 Virtual'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* If Home, address is required */}
                {modality === 'home' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dirección Completa de Domicilio *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Calle, número, apartamento o indicaciones para llegar"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Date and Real Available Time Slots */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Fecha y Horario</h3>
                  <p className="text-xs text-slate-500">
                    Mostramos únicamente horarios con disponibilidad real en el backend.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Selecciona el Día:
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full sm:w-60 px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Horarios Disponibles para {selectedDate}:
                    </label>

                    {loadingSlots ? (
                      <div className="py-10 text-center text-xs text-slate-500 animate-pulse">
                        Verificando agenda y disponibilidad en tiempo real...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">No hay cupos disponibles en esta fecha.</p>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Es posible que el negocio esté cerrado este día o que todos los horarios ya estén ocupados. Por favor selecciona otro día.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              type="button"
                              key={slot.time}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-2 px-1 text-xs font-bold rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                                  : 'border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50/50'
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
              </div>
            )}

            {/* STEP 6: Confirmation & Policies */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Resumen de tu Cita</h3>
                  <p className="text-xs text-slate-500">
                    Verifica la información antes de enviar tu solicitud.
                  </p>
                </div>

                {submissionError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                {/* Summary Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold text-slate-900">
                    <span className="text-sm">{selectedService?.name}</span>
                    <span className="text-sm text-sky-700">
                      ${selectedService?.price.toLocaleString()} {tenant.currency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Fecha y Hora:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedDate} a las {selectedTime}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Duración:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedService?.durationMinutes} minutos
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Cliente:</span>
                      <span className="font-semibold text-slate-800">{customerName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Teléfono:</span>
                      <span className="font-semibold text-slate-800">{customerPhone}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Modalidad:</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {modality === 'presential'
                          ? 'Presencial en Sede'
                          : modality === 'home'
                          ? 'A Domicilio'
                          : 'Virtual'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Profesional:</span>
                      <span className="font-semibold text-slate-800">
                        {assignedStaffMember ? assignedStaffMember.name : 'Cualquiera disponible'}
                      </span>
                    </div>
                  </div>

                  {modality === 'home' && address && (
                    <div className="pt-1 text-[11px]">
                      <span className="text-slate-400 block">Dirección a Domicilio:</span>
                      <span className="font-semibold text-slate-800">{address}</span>
                    </div>
                  )}

                  {/* Custom answers summary */}
                  {customAnswers && Object.keys(customAnswers).length > 0 && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
                      <span className="font-bold text-slate-600 block">Detalles del servicio:</span>
                      {Object.entries(customAnswers).map(([k, v]) => (
                        <p key={k}>
                          • <span className="font-medium">{k}:</span> {String(v)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Terms and Data Privacy Checkboxes */}
                <div className="space-y-2.5 pt-2 text-xs">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedDataPolicy}
                      onChange={(e) => setAcceptedDataPolicy(e.target.checked)}
                      className="rounded text-sky-600 mt-0.5"
                    />
                    <span className="text-slate-600 leading-tight text-[11px]">
                      Autorizo el tratamiento de mis datos personales conforme a la{' '}
                      <strong>Ley 1581 de 2012</strong> de protección de datos para la gestión y
                      recordatorios de esta reserva.
                    </span>
                  </label>

                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="rounded text-sky-600 mt-0.5"
                    />
                    <span className="text-slate-600 leading-tight text-[11px]">
                      Acepto las condiciones y políticas de reserva de{' '}
                      <strong>{tenant.name}</strong>.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 7: Completed Receipt / WhatsApp Redirect */}
            {step === 7 && createdAppointment && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {createdAppointment.status === 'confirmed'
                      ? '¡Tu cita ha sido confirmada con éxito!'
                      : '¡Tu solicitud fue recibida satisfactoriamente!'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {createdAppointment.status === 'confirmed'
                      ? 'Tu espacio en la agenda quedó reservado. Te esperamos en el horario acordado.'
                      : 'Tu cita está pendiente de confirmación por parte de nuestro equipo. Nos comunicaremos contigo en breve.'}
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left max-w-sm mx-auto space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Radicado de Reserva:</span>
                    <span className="font-mono font-bold text-sky-700 px-2 py-0.5 bg-sky-100 rounded">
                      {createdAppointment.bookingCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Servicio:</span>
                    <span className="font-semibold text-slate-800">{createdAppointment.serviceName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Fecha:</span>
                      <span className="font-semibold text-slate-800">{createdAppointment.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Hora:</span>
                      <span className="font-semibold text-slate-800">{createdAppointment.startTime}</span>
                    </div>
                  </div>
                </div>

                {/* Primary WhatsApp Button */}
                <div className="space-y-2 pt-2 max-w-sm mx-auto">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>CONTINUAR POR WHATSAPP</span>
                  </a>
                  <p className="text-[11px] text-slate-400">
                    Haz clic para abrir WhatsApp con los datos de tu reserva ya escritos.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer Controls */}
          {step < 7 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-200 rounded-xl font-medium flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <button
                  type="button"
                  disabled={
                    (step === 1 && !selectedService) ||
                    (step === 2 && (!customerName.trim() || !customerPhone.trim())) ||
                    (step === 4 && modality === 'home' && !address.trim()) ||
                    (step === 5 && !selectedTime)
                  }
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs flex items-center space-x-1"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting || !acceptedTerms || !acceptedDataPolicy}
                  onClick={handleSubmitBooking}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl shadow-md flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Verificando y Guardando...' : 'Confirmar y Reservar'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Plataforma provista por <strong>NOVA SaaS</strong> • Agendamiento Inteligente Multiempresa
      </footer>
    </div>
  );
};

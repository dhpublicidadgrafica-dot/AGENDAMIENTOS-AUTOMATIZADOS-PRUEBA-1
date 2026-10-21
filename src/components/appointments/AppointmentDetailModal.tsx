import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { formatWhatsAppMessage, buildWhatsAppLink } from '../../services/whatsapp';
import { RescheduleModal } from './RescheduleModal';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  PlayCircle,
  UserX,
  MessageSquare,
  FileText,
  History,
  Send,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onUpdated
}) => {
  const { currentTenant, currentUser, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'whatsapp' | 'history'>('info');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  if (!isOpen || !appointment || !currentTenant) return null;

  const isStaff = currentUser.role === 'staff';

  const statusColors: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
    received: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Solicitud Recibida' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente Confirmación' },
    confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmada' },
    in_progress: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'En Proceso' },
    completed: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completada' },
    cancelled: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelada' },
    no_show: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'No Asistió' }
  };

  const currentBadge = statusColors[appointment.status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    label: appointment.status
  };

  const handleStatusChange = async (newStatus: AppointmentStatus, notes?: string) => {
    setUpdating(true);
    try {
      await api.updateAppointmentStatus(
        currentTenant.id,
        appointment.id,
        newStatus,
        currentUser.name,
        notes
      );
      showToast(`Estado actualizado a ${newStatus}`, 'success');
      onUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar estado', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      showToast('Por favor especifica el motivo de la cancelación', 'error');
      return;
    }
    setUpdating(true);
    try {
      await api.cancelAppointment(
        currentTenant.id,
        appointment.id,
        cancelReason,
        currentUser.name
      );
      showToast('Cita cancelada correctamente', 'success');
      setShowCancelPrompt(false);
      onUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error al cancelar cita', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Build WhatsApp preview message
  const templateToUse =
    appointment.status === 'confirmed'
      ? currentTenant.whatsappTemplates.onConfirmed
      : currentTenant.whatsappTemplates.onReceived;
  const whatsappText = formatWhatsAppMessage(templateToUse, appointment, currentTenant);
  const whatsappUrl = buildWhatsAppLink(appointment.customerPhone, whatsappText);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">
                    {appointment.bookingCode}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${currentBadge.bg} ${currentBadge.text}`}
                  >
                    {currentBadge.label}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mt-1">{appointment.serviceName}</h3>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 px-6 bg-slate-50">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
                activeTab === 'info'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Detalles de Cita</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
                activeTab === 'whatsapp'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comunicación WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
                activeTab === 'history'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial de Auditoría ({appointment.history.length})</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
            {activeTab === 'info' && (
              <>
                {/* Cancel Prompt Alert */}
                {showCancelPrompt && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                    <div className="flex items-center space-x-2 text-rose-800 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>¿Confirmas la cancelación de esta cita?</span>
                    </div>
                    <p className="text-xs text-rose-700">
                      Al cancelar, el horario ({appointment.date} {appointment.startTime}) quedará libre inmediatamente en la agenda.
                    </p>
                    <input
                      type="text"
                      placeholder="Escribe el motivo de la cancelación..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-rose-300 rounded-lg bg-white"
                    />
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        Atrás
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={updating}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
                      >
                        Confirmar Cancelación
                      </button>
                    </div>
                  </div>
                )}

                {/* Appointment Primary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left column: Schedule & Service */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Datos de Reserva
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-700">
                      <Calendar className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>
                        Fecha: <strong>{appointment.date}</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-700">
                      <Clock className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>
                        Horario:{' '}
                        <strong>
                          {appointment.startTime} - {appointment.endTime}
                        </strong>{' '}
                        ({appointment.serviceDuration} min)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-700">
                      <User className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>
                        Profesional: <strong>{appointment.staffName || 'Asignación automática'}</strong>
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 pt-1">
                      Valor del servicio:{' '}
                      <strong className="text-slate-900 text-sm">
                        ${(appointment.servicePrice || 0).toLocaleString()} {currentTenant.currency}
                      </strong>
                    </div>
                    <div className="text-xs text-slate-600 capitalize">
                      Modalidad:{' '}
                      <strong>
                        {appointment.modality === 'presential'
                          ? 'Presencial en sede'
                          : appointment.modality === 'home'
                          ? 'A domicilio'
                          : 'Virtual'}
                      </strong>
                    </div>
                    {appointment.address && (
                      <div className="flex items-start space-x-1.5 text-xs text-slate-600">
                        <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>Dirección: {appointment.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Right column: Customer Contact */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Datos del Cliente
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-800 font-semibold">
                      <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>{appointment.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-700">
                      <Phone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <a
                        href={`tel:${appointment.customerPhone}`}
                        className="text-sky-600 hover:underline"
                      >
                        {appointment.customerPhone}
                      </a>
                    </div>
                    {appointment.customerEmail && (
                      <div className="flex items-center space-x-2 text-xs text-slate-700">
                        <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span>{appointment.customerEmail}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir en WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Custom Sector Answers */}
                {appointment.customAnswers && Object.keys(appointment.customAnswers).length > 0 && (
                  <div className="bg-amber-50/60 border border-amber-200/70 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Respuestas Específicas del Sector ({currentTenant.sector}):
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {Object.entries(appointment.customAnswers).map(([k, val]) => (
                        <div key={k} className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                          <span className="text-slate-500 text-[11px] block">{k}:</span>
                          <span className="font-semibold text-slate-800">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internal notes */}
                {appointment.internalNotes && (
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Notas Internas:
                    </span>
                    <p className="text-xs text-slate-700 whitespace-pre-line">
                      {appointment.internalNotes}
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'whatsapp' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  El mensaje se generará dinámicamente con los datos de esta reserva para contactar a{' '}
                  <strong>{appointment.customerName}</strong> ({appointment.customerPhone}).
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mensaje Preparado (Plantilla de {appointment.status}):
                  </label>
                  <textarea
                    readOnly
                    rows={5}
                    value={whatsappText}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-800 font-mono"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-2 shadow-sm transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Abrir Chat de WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(whatsappText);
                      showToast('Mensaje copiado al portapapeles', 'info');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Copiar Mensaje
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className="border-l-2 border-slate-200 ml-3 pl-4 space-y-4">
                  {appointment.history.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="w-2.5 h-2.5 bg-sky-600 rounded-full absolute -left-[21px] top-1 ring-4 ring-white" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{log.action}</p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString()} • Por:{' '}
                          <span className="font-medium text-slate-700">{log.performedBy}</span>
                        </p>
                        {log.details && (
                          <p className="text-xs text-slate-600 mt-0.5 bg-slate-50 p-1.5 rounded border border-slate-100">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            {/* Left: cancellation & reschedule */}
            <div className="flex items-center space-x-2">
              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                <>
                  <button
                    onClick={() => setShowCancelPrompt(true)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reprogramar</span>
                  </button>
                </>
              )}
            </div>

            {/* Right: State progression buttons */}
            <div className="flex items-center space-x-2">
              {appointment.status === 'received' || appointment.status === 'pending' ? (
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={updating}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Cita</span>
                </button>
              ) : null}

              {appointment.status === 'confirmed' ? (
                <>
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updating}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center space-x-1.5"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Iniciar Atención</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('no_show')}
                    disabled={updating}
                    className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center space-x-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>No Asistió</span>
                  </button>
                </>
              ) : null}

              {appointment.status === 'in_progress' ? (
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={updating}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Marcar Completada</span>
                </button>
              ) : null}

              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRescheduleModal && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          appointment={appointment}
          onClose={() => setShowRescheduleModal(false)}
          onSuccess={() => {
            onUpdated();
            onClose();
          }}
        />
      )}
    </>
  );
};

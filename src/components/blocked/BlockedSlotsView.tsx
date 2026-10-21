import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { BlockedSlot, Staff } from '../../types';
import { Ban, Plus, Trash2, Calendar, Clock, X, AlertCircle } from 'lucide-react';

export const BlockedSlotsView: React.FC = () => {
  const { currentTenant, showToast } = useApp();

  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [allDay, setAllDay] = useState<boolean>(true);
  const [staffId, setStaffId] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const loadData = async () => {
    if (!currentTenant) return;
    setLoading(true);
    try {
      const [fetchedBlocks, staffs] = await Promise.all([
        api.getBlockedSlots(currentTenant.id),
        api.getStaff(currentTenant.id)
      ]);
      setBlocks(fetchedBlocks);
      setStaffList(staffs);
    } catch (err) {
      console.error('Error fetching blocked slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      showToast('Por favor completa el título y la fecha', 'error');
      return;
    }

    try {
      await api.createBlockedSlot(currentTenant!.id, {
        title: title.trim(),
        date,
        startTime: allDay ? '00:00' : startTime,
        endTime: allDay ? '23:59' : endTime,
        allDay,
        staffId: staffId || undefined,
        reason: reason.trim() || undefined
      });

      showToast('Bloqueo registrado en la agenda', 'success');
      setIsOpenModal(false);
      setTitle('');
      setReason('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al crear bloqueo', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas desbloquear este horario?')) return;
    try {
      await api.deleteBlockedSlot(currentTenant!.id, id);
      showToast('Bloqueo eliminado', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Bloqueos de Horario y Festivos</h2>
          <p className="text-xs text-slate-500">
            Bloquea días festivos, vacaciones de profesionales o franjas de mantenimiento de equipos
          </p>
        </div>
        <button
          onClick={() => setIsOpenModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Bloqueo</span>
        </button>
      </div>

      {/* Grid of Blocks */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando bloqueos...</div>
        ) : blocks.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Ban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">No hay bloqueos activos en el calendario</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Todos los horarios normales de atención están disponibles para clientes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blocks.map((b) => {
              const staffObj = staffList.find((s) => s.id === b.staffId);
              return (
                <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Ban className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fecha: <strong>{b.date}</strong> •{' '}
                        {b.allDay ? 'Todo el día' : `${b.startTime} - ${b.endTime}`}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Afecta a:{' '}
                        <strong>
                          {staffObj ? `Profesional: ${staffObj.name}` : 'Toda la empresa'}
                        </strong>
                      </p>
                      {b.reason && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">Motivo: {b.reason}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar bloqueo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-semibold text-sm">Bloquear Horario o Día Festivo</h3>
              <button onClick={() => setIsOpenModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título del Bloqueo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Día Festivo Nacional, Mantenimiento Spa..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allDayCheck"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="allDayCheck" className="font-semibold text-slate-800 cursor-pointer">
                  Bloquear todo el día completo
                </label>
              </div>

              {!allDay && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Profesional Afectado (Opcional)
                </label>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Bloqueo para toda la empresa</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      Solo para: {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo o Notas</label>
                <input
                  type="text"
                  placeholder="Detalles adicionales..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
                >
                  Guardar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Staff, Service, DayOfWeek, WeeklySchedule } from '../../types';
import { initialSchedule } from '../../server/initialData';
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  Clock,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { currentTenant, showToast } = useApp();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [active, setActive] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);

  const loadStaffData = async () => {
    if (!currentTenant) return;
    setLoading(true);
    try {
      const [staffs, servs] = await Promise.all([
        api.getStaff(currentTenant.id),
        api.getServices(currentTenant.id)
      ]);
      setStaffList(staffs);
      setServices(servs);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, [currentTenant]);

  const openCreateModal = () => {
    setEditingStaffId(null);
    setName('');
    setRoleTitle('');
    setEmail('');
    setPhone('');
    setAvatar('');
    setSelectedServiceIds(services.map((s) => s.id));
    setActive(true);
    setSchedule(currentTenant?.defaultSchedule || initialSchedule);
    setIsModalOpen(true);
  };

  const openEditModal = (st: Staff) => {
    setEditingStaffId(st.id);
    setName(st.name);
    setRoleTitle(st.roleTitle);
    setEmail(st.email);
    setPhone(st.phone || '');
    setAvatar(st.avatar || '');
    setSelectedServiceIds(st.serviceIds || []);
    setActive(st.active);
    setSchedule(st.schedule || currentTenant?.defaultSchedule || initialSchedule);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roleTitle.trim()) {
      showToast('Por favor completa el nombre y el cargo/especialidad', 'error');
      return;
    }

    try {
      const payload: Partial<Staff> = {
        name: name.trim(),
        roleTitle: roleTitle.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
        serviceIds: selectedServiceIds,
        schedule,
        active
      };

      if (editingStaffId) {
        await api.updateStaff(currentTenant!.id, editingStaffId, payload);
        showToast('Empleado actualizado exitosamente', 'success');
      } else {
        await api.createStaff(currentTenant!.id, payload);
        showToast('Empleado registrado exitosamente', 'success');
      }

      setIsModalOpen(false);
      loadStaffData();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar empleado', 'error');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('¿Deseas eliminar a este empleado?')) return;
    try {
      await api.deleteStaff(currentTenant!.id, id);
      showToast('Empleado eliminado', 'info');
      loadStaffData();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar empleado', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Equipo y Profesionales</h2>
          <p className="text-xs text-slate-500">
            Administra los profesionales habilitados para atender citas y sus horarios individuales
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Profesional</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((st) => (
          <div
            key={st.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
              st.active ? 'border-slate-200 hover:border-sky-300' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={
                    st.avatar ||
                    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80`
                  }
                  alt={st.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{st.name}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        st.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {st.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-sky-600 font-medium truncate">{st.roleTitle}</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1 text-xs text-slate-600 mb-3">
                <div className="flex items-center space-x-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{st.email}</span>
                </div>
                {st.phone && (
                  <div className="flex items-center space-x-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{st.phone}</span>
                  </div>
                )}
              </div>

              {/* Active services count */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Servicios que presta: </span>
                {st.serviceIds && st.serviceIds.length > 0 ? (
                  <span>{st.serviceIds.length} servicios asignados</span>
                ) : (
                  <span className="text-slate-400 italic">Todos los servicios</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-end space-x-2">
              <button
                onClick={() => openEditModal(st)}
                className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDeleteStaff(st.id)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Eliminar profesional"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">
                  {editingStaffId ? 'Editar Profesional' : 'Nuevo Profesional'}
                </h3>
                <p className="text-xs text-slate-300">Empresa: {currentTenant?.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Valentina Gómez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cargo / Especialidad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Estilista Canino Master"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">URL de Foto / Avatar</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Services assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Servicios que este profesional puede atender:
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  {services.map((srv) => (
                    <label key={srv.id} className="flex items-center space-x-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(srv.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedServiceIds([...selectedServiceIds, srv.id]);
                          else setSelectedServiceIds(selectedServiceIds.filter((id) => id !== srv.id));
                        }}
                        className="rounded text-sky-600"
                      />
                      <span>
                        {srv.name} (${srv.price.toLocaleString()})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <span>Profesional Activo para Agendamiento</span>
              </label>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm"
                >
                  Guardar Profesional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

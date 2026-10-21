import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Service, Staff, ModalityType, DynamicField } from '../../types';
import {
  Briefcase,
  Plus,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  HelpCircle,
  PlusCircle,
  Sliders
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { currentTenant, showToast } = useApp();

  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(50000);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [bufferMinutes, setBufferMinutes] = useState<number>(10);
  const [modalities, setModalities] = useState<ModalityType[]>(['presential']);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [active, setActive] = useState<boolean>(true);

  // Field builder
  const [newFieldLabel, setNewFieldLabel] = useState<string>('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'number' | 'select'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState<string>('');
  const [newFieldRequired, setNewFieldRequired] = useState<boolean>(true);

  const loadServices = async () => {
    if (!currentTenant) return;
    setLoading(true);
    try {
      const [srvs, staffs] = await Promise.all([
        api.getServices(currentTenant.id),
        api.getStaff(currentTenant.id)
      ]);
      setServices(srvs);
      setStaffList(staffs);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [currentTenant]);

  const openCreateModal = () => {
    setEditingServiceId(null);
    setName('');
    setCategory('General');
    setDescription('');
    setPrice(45000);
    setDurationMinutes(45);
    setBufferMinutes(10);
    setModalities(['presential']);
    setSelectedStaffIds(staffList.map((s) => s.id));
    setDynamicFields([]);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingServiceId(service.id);
    setName(service.name);
    setCategory(service.category);
    setDescription(service.description);
    setPrice(service.price);
    setDurationMinutes(service.durationMinutes);
    setBufferMinutes(service.bufferMinutes || 0);
    setModalities(service.modalities || ['presential']);
    setSelectedStaffIds(service.staffIds || []);
    setDynamicFields(service.dynamicFields || []);
    setActive(service.active);
    setIsModalOpen(true);
  };

  const handleAddDynamicField = () => {
    if (!newFieldLabel.trim()) return;
    const fieldId = newFieldLabel
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);

    const newField: DynamicField = {
      id: `${fieldId}_${Date.now().toString().slice(-4)}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      options:
        newFieldType === 'select'
          ? newFieldOptions
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined
    };

    setDynamicFields([...dynamicFields, newField]);
    setNewFieldLabel('');
    setNewFieldOptions('');
  };

  const handleRemoveDynamicField = (index: number) => {
    setDynamicFields(dynamicFields.filter((_, i) => i !== index));
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Por favor escribe el nombre del servicio', 'error');
      return;
    }

    try {
      const payload: Partial<Service> = {
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        durationMinutes: Number(durationMinutes),
        bufferMinutes: Number(bufferMinutes),
        modalities,
        staffIds: selectedStaffIds,
        dynamicFields,
        active,
        order: services.length + 1
      };

      if (editingServiceId) {
        await api.updateService(currentTenant!.id, editingServiceId, payload);
        showToast('Servicio actualizado con éxito', 'success');
      } else {
        await api.createService(currentTenant!.id, payload);
        showToast('Servicio creado exitosamente', 'success');
      }

      setIsModalOpen(false);
      loadServices();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el servicio', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await api.deleteService(currentTenant!.id, id);
      showToast('Servicio eliminado', 'info');
      loadServices();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar servicio', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Catálogo de Servicios</h2>
          <p className="text-xs text-slate-500">
            Define servicios, precios, tiempos de preparación y preguntas dinámicas del sector (
            {currentTenant?.sector})
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Servicio</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
              srv.active ? 'border-slate-200 hover:border-sky-300' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                  {srv.category}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    srv.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {srv.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mb-1">{srv.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{srv.description}</p>

              {/* Badges for duration and buffer */}
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <div className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>{srv.durationMinutes} min</span>
                </div>
                {srv.bufferMinutes > 0 && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-amber-50 rounded-lg text-amber-800 font-medium">
                    <span>+{srv.bufferMinutes}m pausa/limpieza</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 rounded-lg text-emerald-800 font-bold">
                  <span>
                    ${srv.price.toLocaleString()} {currentTenant?.currency}
                  </span>
                </div>
              </div>

              {/* Dynamic Questions preview */}
              {srv.dynamicFields && srv.dynamicFields.length > 0 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-3 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-1">
                    Preguntas requeridas al agendar:
                  </span>
                  <ul className="space-y-0.5 list-disc list-inside">
                    {srv.dynamicFields.slice(0, 3).map((f) => (
                      <li key={f.id} className="truncate">
                        {f.label}
                      </li>
                    ))}
                    {srv.dynamicFields.length > 3 && (
                      <li className="text-slate-400">+{srv.dynamicFields.length - 3} preguntas más</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => openEditModal(srv)}
                className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDeleteService(srv.id)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Eliminar servicio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">
                  {editingServiceId ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h3>
                <p className="text-xs text-slate-300">Empresa: {currentTenant?.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Baño & Corte Completo, Consulta Dental, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Precio ({currentTenant?.currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duración del Servicio (Minutos) *
                  </label>
                  <input
                    type="number"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Margen Adicional (Limpieza / Preparación) Minutos
                  </label>
                  <input
                    type="number"
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Dynamic Sector Form Builder */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-600" />
                    <span>Campos Personalizados del Cliente (Formulario Dinámico)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Preguntas específicas para el sector {currentTenant?.sector}
                  </span>
                </div>

                {/* Existing dynamic fields list */}
                {dynamicFields.length > 0 && (
                  <div className="space-y-1.5">
                    {dynamicFields.map((df, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{df.label}</span>
                          <span className="text-slate-400 text-[10px] ml-2">
                            ({df.type}) {df.required ? '• Obligatorio' : '• Opcional'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDynamicField(i)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new dynamic field */}
                <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Pregunta o campo (Ej. Raza de mascota)"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="sm:col-span-2 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <select
                    value={newFieldType}
                    onChange={(e: any) => setNewFieldType(e.target.value)}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="text">Texto corto</option>
                    <option value="textarea">Texto largo</option>
                    <option value="number">Número</option>
                    <option value="select">Opciones de selección</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddDynamicField}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar</span>
                  </button>

                  {newFieldType === 'select' && (
                    <input
                      type="text"
                      placeholder="Opciones separadas por coma (Ej. Raza Pequeña, Mediana, Grande)"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      className="sm:col-span-4 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Modality & Active */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center space-x-4 text-xs">
                  <label className="font-semibold text-slate-700">Modalidades:</label>
                  <label className="flex items-center space-x-1.5">
                    <input
                      type="checkbox"
                      checked={modalities.includes('presential')}
                      onChange={(e) => {
                        if (e.target.checked) setModalities([...modalities, 'presential']);
                        else setModalities(modalities.filter((m) => m !== 'presential'));
                      }}
                    />
                    <span>Presencial</span>
                  </label>
                  <label className="flex items-center space-x-1.5">
                    <input
                      type="checkbox"
                      checked={modalities.includes('home')}
                      onChange={(e) => {
                        if (e.target.checked) setModalities([...modalities, 'home']);
                        else setModalities(modalities.filter((m) => m !== 'home'));
                      }}
                    />
                    <span>A Domicilio</span>
                  </label>
                  <label className="flex items-center space-x-1.5">
                    <input
                      type="checkbox"
                      checked={modalities.includes('virtual')}
                      onChange={(e) => {
                        if (e.target.checked) setModalities([...modalities, 'virtual']);
                        else setModalities(modalities.filter((m) => m !== 'virtual'));
                      }}
                    />
                    <span>Virtual</span>
                  </label>
                </div>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <span>Servicio Activo en Catálogo Público</span>
                </label>
              </div>

              {/* Submit Buttons */}
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
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

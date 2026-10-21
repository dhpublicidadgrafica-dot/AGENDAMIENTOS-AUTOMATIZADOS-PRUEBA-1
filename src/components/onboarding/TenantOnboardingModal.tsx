import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SectorType, Tenant, Service } from '../../types';
import { initialSchedule } from '../../server/initialData';
import {
  X,
  Building2,
  Palette,
  Briefcase,
  Clock,
  Phone,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

interface TenantOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TenantOnboardingModal: React.FC<TenantOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { refreshTenants, setCurrentTenant, showToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Step 1: Basic info
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [sector, setSector] = useState<SectorType>('grooming');
  const [description, setDescription] = useState<string>('');

  // Step 2: Branding
  const [logo, setLogo] = useState<string>('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&h=200&q=80');
  const [primaryColor, setPrimaryColor] = useState<string>('#0284c7');
  const [accentColor, setAccentColor] = useState<string>('#0ea5e9');

  // Step 3: Contact & Location
  const [phone, setPhone] = useState<string>('+57 300 000 0000');
  const [whatsapp, setWhatsapp] = useState<string>('573000000000');
  const [email, setEmail] = useState<string>('contacto@empresa.com');
  const [address, setAddress] = useState<string>('Calle 100 # 15-20, Bogotá');

  // Step 4: First Service
  const [firstServiceName, setFirstServiceName] = useState<string>('Servicio Principal');
  const [firstServicePrice, setFirstServicePrice] = useState<number>(50000);
  const [firstServiceDuration, setFirstServiceDuration] = useState<number>(45);

  if (!isOpen) return null;

  const handleSectorChange = (sec: SectorType) => {
    setSector(sec);
    if (sec === 'grooming') {
      setFirstServiceName('Baño y Spa Completo');
      setFirstServicePrice(45000);
      setLogo('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&h=200&q=80');
    } else if (sec === 'barbershop') {
      setFirstServiceName('Corte Clásico & Fade');
      setFirstServicePrice(30000);
      setLogo('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&h=200&q=80');
    } else if (sec === 'health_dental') {
      setFirstServiceName('Valoración y Limpieza');
      setFirstServicePrice(80000);
      setLogo('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=200&h=200&q=80');
    } else if (sec === 'automotive') {
      setFirstServiceName('Mantenimiento y Cambio de Aceite');
      setFirstServicePrice(120000);
      setLogo('https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=200&h=200&q=80');
    }
  };

  const handleFinish = async () => {
    if (!name.trim() || !slug.trim()) {
      showToast('Por favor completa el nombre de la empresa y el slug', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');

      // 1. Create Tenant
      const newTenant = await api.createTenant({
        name: name.trim(),
        slug: cleanSlug,
        sector,
        description: description.trim() || `Servicios profesionales de ${sector}`,
        logo,
        primaryColor,
        accentColor,
        phone,
        whatsapp: whatsapp.replace(/\D/g, ''),
        email,
        address,
        timezone: 'America/Bogota',
        currency: 'COP',
        autoConfirm: false,
        advanceMinHours: 2,
        advanceMaxDays: 30,
        cancelMinHours: 6,
        slotIntervalMinutes: 30,
        defaultSchedule: initialSchedule,
        bookingTerms: 'Llegar 5 minutos antes. Presentar documento de identidad.',
        dataPolicyNotice: 'Tratamiento conforme a la Ley 1581 de 2012 para agendamiento de citas.',
        whatsappTemplates: {
          onReceived: `Hola {empresa}, acabo de agendar una cita para {servicio} el día {fecha} a las {hora}. Código: {codigo}.`,
          onConfirmed: `Hola {cliente}, tu cita en {empresa} para {servicio} ha sido CONFIRMADA para el {fecha} a las {hora}.`,
          onRescheduled: `Hola {cliente}, tu cita en {empresa} ha sido reprogramada para el {fecha} a las {hora}.`,
          onCancelled: `Hola {cliente}, tu cita {codigo} en {empresa} ha sido cancelada.`
        },
        status: 'active'
      });

      // 2. Create Initial Service
      await api.createService(newTenant.id, {
        name: firstServiceName,
        category: 'General',
        description: 'Servicio inicial configurado en el registro.',
        price: Number(firstServicePrice),
        durationMinutes: Number(firstServiceDuration),
        bufferMinutes: 10,
        modalities: ['presential'],
        staffIds: [],
        dynamicFields: [],
        active: true,
        order: 1
      });

      showToast(`¡Empresa "${newTenant.name}" creada con éxito!`, 'success');
      await refreshTenants();
      setCurrentTenant(newTenant);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error al crear empresa', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Asistente de Nueva Empresa SaaS</span>
            </h3>
            <p className="text-xs text-slate-300">
              Paso {step} de 4: {step === 1 ? 'Datos Básicos' : step === 2 ? 'Identidad Visual' : step === 3 ? 'Contacto' : 'Primer Servicio'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-sky-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Comercial de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Spa Canino BellaPet, Barbería Vintage..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')
                          .replace(/-+/g, '-')
                      );
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Identificador URL (Slug público) *
                </label>
                <div className="flex items-center">
                  <span className="px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-slate-500 font-mono text-xs">
                    /reservar/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-r-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sector Empresarial *
                </label>
                <select
                  value={sector}
                  onChange={(e) => handleSectorChange(e.target.value as SectorType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="grooming">Grooming & Peluquería Canina</option>
                  <option value="barbershop">Barbería & Peluquería</option>
                  <option value="health_dental">Consultorio Médico / Odontológico</option>
                  <option value="beauty_spa">Centro de Estética & Belleza</option>
                  <option value="veterinary">Clínica Veterinaria</option>
                  <option value="therapy_psychology">Psicología & Terapias</option>
                  <option value="automotive">Taller Automotriz</option>
                  <option value="tech_services">Servicios Técnicos</option>
                  <option value="consulting">Asesorías Profesionales</option>
                  <option value="general">Otro negocio de citas</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción Breve</label>
                <textarea
                  rows={2}
                  placeholder="Describe a qué se dedica tu negocio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL de Logo</label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <div className="mt-2 flex items-center space-x-3">
                  <img
                    src={logo}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <span className="text-[11px] text-slate-400">Vista previa del logo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color Principal</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 p-0 border border-slate-300 rounded cursor-pointer"
                    />
                    <span className="font-mono">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color de Acento</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 p-0 border border-slate-300 rounded cursor-pointer"
                    />
                    <span className="font-mono">{accentColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Número de WhatsApp para Reservas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="573001234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Incluye código de país sin el signo '+' ni espacios (ej. 573001234567).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono Fijo / Celular</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección de Sede</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-[11px]">
                Configura tu primer servicio para que los clientes puedan empezar a reservar de inmediato.
                Podrás agregar más servicios y preguntas personalizadas luego desde el catálogo.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={firstServiceName}
                  onChange={(e) => setFirstServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio (COP) *</label>
                  <input
                    type="number"
                    required
                    value={firstServicePrice}
                    onChange={(e) => setFirstServicePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duración (Minutos) *
                  </label>
                  <input
                    type="number"
                    required
                    value={firstServiceDuration}
                    onChange={(e) => setFirstServiceDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded-lg font-medium flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && (!name.trim() || !slug.trim())}
              onClick={() => setStep(step + 1)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-lg shadow-xs flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !firstServiceName.trim()}
              onClick={handleFinish}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-sm flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Creando Empresa...' : 'Activar y Comenzar'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

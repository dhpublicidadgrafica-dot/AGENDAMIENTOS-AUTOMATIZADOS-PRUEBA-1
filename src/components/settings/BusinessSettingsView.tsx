import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Tenant, WhatsAppTemplates } from '../../types';
import { Settings, Save, MessageSquare, Shield, Building2, HelpCircle } from 'lucide-react';

export const BusinessSettingsView: React.FC = () => {
  const { currentTenant, refreshTenants, showToast } = useApp();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logo, setLogo] = useState<string>('');
  const [banner, setBanner] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('America/Bogota');
  const [currency, setCurrency] = useState<string>('COP');
  const [autoConfirm, setAutoConfirm] = useState<boolean>(false);
  const [bookingTerms, setBookingTerms] = useState<string>('');
  const [dataPolicyNotice, setDataPolicyNotice] = useState<string>('');
  const [templates, setTemplates] = useState<WhatsAppTemplates>({
    onReceived: '',
    onConfirmed: '',
    onRescheduled: '',
    onCancelled: ''
  });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (currentTenant) {
      setName(currentTenant.name);
      setDescription(currentTenant.description);
      setLogo(currentTenant.logo);
      setBanner(currentTenant.banner || '');
      setPhone(currentTenant.phone);
      setEmail(currentTenant.email);
      setWhatsapp(currentTenant.whatsapp);
      setAddress(currentTenant.address);
      setTimezone(currentTenant.timezone);
      setCurrency(currentTenant.currency);
      setAutoConfirm(currentTenant.autoConfirm);
      setBookingTerms(currentTenant.bookingTerms);
      setDataPolicyNotice(currentTenant.dataPolicyNotice);
      setTemplates(currentTenant.whatsappTemplates);
    }
  }, [currentTenant]);

  if (!currentTenant) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateTenant(currentTenant.id, {
        name: name.trim(),
        description: description.trim(),
        logo: logo.trim(),
        banner: banner.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        address: address.trim(),
        timezone,
        currency,
        autoConfirm,
        bookingTerms: bookingTerms.trim(),
        dataPolicyNotice: dataPolicyNotice.trim(),
        whatsappTemplates: templates
      });
      showToast('Configuración empresarial guardada exitosamente', 'success');
      refreshTenants();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Configuración de Empresa</h2>
          <p className="text-xs text-slate-500">
            Administra los datos corporativos, políticas de datos y plantillas dinámicas de WhatsApp
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>Perfil Corporativo</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sector Empresarial</label>
              <input
                type="text"
                disabled
                value={currentTenant.sector}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-500 capitalize"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Descripción del Negocio</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL del Logo</label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL de Portada / Banner</label>
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dirección Física</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono Principal</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Número de WhatsApp (con código país)</label>
              <input
                type="text"
                placeholder="Ej. 573001234567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico de Contacto</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Confirmation Behavior & Policies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>Reglas de Aprobación y Protección de Datos</span>
          </h3>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoConfirm}
                onChange={(e) => setAutoConfirm(e.target.checked)}
                className="rounded text-sky-600 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Habilitar Confirmación Automática de Citas
                </span>
                <span className="text-[11px] text-slate-500">
                  Si se activa, las citas quedan directamente en estado CONFIRMADA al enviarse el formulario.
                  Si se desactiva, quedan como SOLICITUD RECIBIDA para aprobación previa del recepcionista.
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Términos y Condiciones de Reserva
              </label>
              <textarea
                rows={3}
                value={bookingTerms}
                onChange={(e) => setBookingTerms(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aviso de Tratamiento de Datos Personales (Ley 1581 de 2012)
              </label>
              <textarea
                rows={3}
                value={dataPolicyNotice}
                onChange={(e) => setDataPolicyNotice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Message Templates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Plantillas Dinámicas de WhatsApp</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Variables soportadas: {'{empresa}'}, {'{cliente}'}, {'{servicio}'}, {'{fecha}'}, {'{hora}'}, {'{codigo}'}, {'{profesional}'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mensaje de Solicitud Recibida (Generado al enviar el formulario):
              </label>
              <textarea
                rows={2}
                value={templates.onReceived}
                onChange={(e) => setTemplates({ ...templates, onReceived: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mensaje de Cita Confirmada:
              </label>
              <textarea
                rows={2}
                value={templates.onConfirmed}
                onChange={(e) => setTemplates({ ...templates, onConfirmed: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mensaje de Cita Reprogramada:
              </label>
              <textarea
                rows={2}
                value={templates.onRescheduled}
                onChange={(e) => setTemplates({ ...templates, onRescheduled: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mensaje de Cita Cancelada:
              </label>
              <textarea
                rows={2}
                value={templates.onCancelled}
                onChange={(e) => setTemplates({ ...templates, onCancelled: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Todos los Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Globe, Copy, ExternalLink, Save, Check, Palette } from 'lucide-react';

export const PublicPageConfigView: React.FC = () => {
  const { currentTenant, setPublicTenantSlug, refreshTenants, showToast } = useApp();

  const [slug, setSlug] = useState<string>(currentTenant?.slug || '');
  const [primaryColor, setPrimaryColor] = useState<string>(currentTenant?.primaryColor || '#0284c7');
  const [accentColor, setAccentColor] = useState<string>(currentTenant?.accentColor || '#0ea5e9');
  const [copied, setCopied] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  if (!currentTenant) return null;

  const publicUrl = `${window.location.origin}/reservar/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Enlace público copiado al portapapeles', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (!cleanSlug) {
      showToast('Por favor escribe un slug válido', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.updateTenant(currentTenant.id, {
        slug: cleanSlug,
        primaryColor,
        accentColor
      });
      showToast('Configuración de página pública guardada', 'success');
      refreshTenants();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar página pública', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Página Pública de Reservas</h2>
          <p className="text-xs text-slate-500">
            Personaliza el enlace directo y los colores de la interfaz que tus clientes verán para agendar
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Link / URL Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span>Enlace Personalizado de la Empresa</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identificador URL (Slug):
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-200 text-slate-600 border border-r-0 border-slate-300 rounded-l-lg text-xs font-mono">
                  /reservar/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                  className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-r-lg text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Enlace'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPublicTenantSlug(currentTenant.slug)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Vista Previa en Vivo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Branding Colors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Palette className="w-4 h-4 text-sky-600" />
            <span>Colores de Marca</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Color Principal</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 p-0 border border-slate-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Color de Énfasis (Acento)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 p-0 border border-slate-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

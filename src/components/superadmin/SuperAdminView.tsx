import React from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ShieldCheck, Building2, CheckCircle2, Ban, ExternalLink, ArrowRight } from 'lucide-react';

interface SuperAdminViewProps {
  onOpenOnboarding: () => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ onOpenOnboarding }) => {
  const { tenants, setCurrentTenant, setActiveView, setPublicTenantSlug, refreshTenants, showToast } =
    useApp();

  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateTenant(id, { status: newStatus });
      showToast(`Estado de la empresa actualizado a ${newStatus}`, 'success');
      refreshTenants();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">Panel de Superadministrador NOVA</h2>
          </div>
          <p className="text-xs text-indigo-200 mt-1">
            Gestión global de empresas (tenants), aislamiento multiempresa y monitoreo de la plataforma
          </p>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          + Registrar Nueva Empresa
        </button>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Empresas Registradas ({tenants.length})
          </h3>
          <span className="text-[11px] text-slate-500">Cada empresa tiene su base de datos y aislamiento estricto</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Ruta Pública</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={t.logo}
                        alt={t.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{t.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {t.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 capitalize text-slate-700 font-medium">
                    {t.sector}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <p>{t.phone}</p>
                    <p className="text-[11px] text-slate-400">{t.email}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-sky-600">
                    /reservar/{t.slug}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {t.status === 'active' ? 'Activa' : 'Suspendida'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setCurrentTenant(t);
                          setActiveView('overview');
                          showToast(`Cambiado a la empresa "${t.name}"`, 'info');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                        title="Administrar esta empresa"
                      >
                        <span>Entrar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(t.id, t.status)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          t.status === 'active'
                            ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                        title={t.status === 'active' ? 'Suspender empresa' : 'Reactivar empresa'}
                      >
                        {t.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setPublicTenantSlug(t.slug)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        title="Ver página de agendamiento pública"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

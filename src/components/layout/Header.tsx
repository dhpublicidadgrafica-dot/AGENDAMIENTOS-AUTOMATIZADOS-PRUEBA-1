import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  User,
  Shield,
  Plus,
  ExternalLink,
  ChevronDown,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface HeaderProps {
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOnboarding }) => {
  const {
    tenants,
    currentTenant,
    setCurrentTenant,
    currentUser,
    setCurrentUser,
    users,
    setPublicTenantSlug
  } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Tenant selector */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa Activa:</span>
        </div>

        <div className="relative">
          <select
            value={currentTenant?.id || ''}
            onChange={(e) => {
              const selected = tenants.find((t) => t.id === e.target.value);
              if (selected) setCurrentTenant(selected);
            }}
            className="text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors cursor-pointer"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.sector.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Add New Tenant Button */}
        <button
          onClick={onOpenOnboarding}
          className="text-xs flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-medium transition-colors"
          title="Registrar una nueva empresa en la plataforma SaaS"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Empresa</span>
        </button>

        {currentTenant && (
          <button
            onClick={() => setPublicTenantSlug(currentTenant.slug)}
            className="hidden sm:flex text-xs items-center space-x-1 text-sky-600 hover:text-sky-700 font-medium px-2 py-1 rounded hover:bg-sky-50"
          >
            <span>/reservar/{currentTenant.slug}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Right: User / Role switcher simulation */}
      <div className="flex items-center space-x-4">
        {/* Role Switcher */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-medium text-slate-500">Rol:</span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = users.find((usr) => usr.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="text-xs font-medium text-slate-700 bg-transparent border-0 focus:outline-none cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} [{u.role.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>

        {/* User Avatar badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

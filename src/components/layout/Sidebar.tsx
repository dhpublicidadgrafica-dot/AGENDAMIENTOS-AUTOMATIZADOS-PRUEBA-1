import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Users,
  Briefcase,
  UserCheck,
  Clock,
  Ban,
  Globe,
  Settings,
  BarChart3,
  ShieldCheck,
  Database,
  ExternalLink,
  PlusCircle,
  Building2,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  onOpenNewAppointment: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewAppointment }) => {
  const { currentTenant, activeView, setActiveView, setPublicTenantSlug, currentUser } = useApp();

  const isSuperAdmin = currentUser.role === 'superadmin';
  const isStaffOnly = currentUser.role === 'staff';

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'appointments', label: 'Citas y Reservas', icon: CalendarCheck },
    { id: 'customers', label: 'Clientes', icon: Users, hideForStaff: true },
    { id: 'services', label: 'Servicios', icon: Briefcase, hideForStaff: true },
    { id: 'staff', label: 'Empleados / Equipo', icon: UserCheck, hideForStaff: true },
    { id: 'availability', label: 'Horarios y Disponibilidad', icon: Clock, hideForStaff: true },
    { id: 'blocked', label: 'Bloqueos y Festivos', icon: Ban, hideForStaff: true },
    { id: 'public_page_config', label: 'Página de Reservas', icon: Globe, hideForStaff: true },
    { id: 'business_settings', label: 'Configuración Empresa', icon: Settings, hideForStaff: true },
    { id: 'reports', label: 'Reportes y Métricas', icon: BarChart3, hideForStaff: true },
    { id: 'superadmin', label: 'Superadmin Plataforma', icon: ShieldCheck, superAdminOnly: true },
    { id: 'firebase_info', label: 'Integración Firebase', icon: Database }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 select-none">
      {/* Brand & Tenant header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20">
            N
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-base tracking-tight">NOVA</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-semibold uppercase tracking-wider">
                SaaS
              </span>
            </div>
            <p className="text-xs text-slate-400">Agendamientos Inteligentes</p>
          </div>
        </div>

        {/* Current Tenant Badge */}
        {currentTenant && (
          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
            <div className="flex items-center space-x-2.5">
              <img
                src={currentTenant.logo}
                alt={currentTenant.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-600"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-100 truncate">{currentTenant.name}</p>
                <div className="flex items-center text-[11px] text-slate-400 truncate">
                  <span className="capitalize">{currentTenant.sector}</span>
                  <span className="mx-1">•</span>
                  <span className="text-emerald-400 font-medium">Activa</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onOpenNewAppointment}
          className="w-full py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Crear Cita Manual</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
          Menú Principal
        </div>
        {menuItems.map((item) => {
          if (item.superAdminOnly && !isSuperAdmin) return null;
          if (item.hideForStaff && isStaffOnly) return null;

          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400" />}
            </button>
          );
        })}
      </div>

      {/* Public Page Shortcut footer */}
      {currentTenant && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={() => setPublicTenantSlug(currentTenant.slug)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700/70 transition-colors"
            title="Abrir la página de reservas que ven los clientes"
          >
            <div className="flex items-center space-x-2 truncate">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">Ver Página Pública</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}
    </aside>
  );
};

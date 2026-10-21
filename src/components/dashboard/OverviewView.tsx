import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { AppointmentDetailModal } from '../appointments/AppointmentDetailModal';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Plus,
  Users,
  Briefcase,
  Ban,
  Globe,
  ArrowRight,
  User,
  Phone,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface OverviewViewProps {
  onOpenNewAppointment: () => void;
  onOpenNewService?: () => void;
  onOpenBlockedSlot?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenNewAppointment,
  onOpenNewService,
  onOpenBlockedSlot
}) => {
  const { currentTenant, setActiveView, setPublicTenantSlug, showToast } = useApp();

  const [stats, setStats] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const loadOverviewData = async () => {
    if (!currentTenant) return;
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [fetchedStats, todayApts] = await Promise.all([
        api.getStats(currentTenant.id),
        api.getAppointments(currentTenant.id, { date: todayStr })
      ]);
      setStats(fetchedStats);
      setTodayAppointments(todayApts);
    } catch (err) {
      console.error('Error fetching overview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, [currentTenant]);

  if (!currentTenant) {
    return <div className="p-8 text-center text-slate-500">Selecciona una empresa.</div>;
  }

  const kpis = [
    {
      title: 'Citas Hoy',
      count: stats?.todayCount ?? 0,
      icon: CalendarDays,
      color: 'text-sky-600',
      bg: 'bg-sky-50 border-sky-100'
    },
    {
      title: 'Pendientes',
      count: stats?.pendingCount ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100'
    },
    {
      title: 'Confirmadas',
      count: stats?.confirmedCount ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Completadas',
      count: stats?.completedCount ?? 0,
      icon: Sparkles,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Canceladas',
      count: stats?.cancelledCount ?? 0,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100'
    },
    {
      title: 'Ingresos Proyectados',
      count: `$${((stats?.confirmedProjectedRevenue || 0) + (stats?.completedRevenue || 0)).toLocaleString()}`,
      subtitle: `${currentTenant.currency}`,
      icon: TrendingUp,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Business Profile Summary */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentTenant.logo}
            alt={currentTenant.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight">{currentTenant.name}</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase">
                {currentTenant.sector}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{currentTenant.description}</p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
              <span>{currentTenant.address}</span>
              <span>•</span>
              <span>WhatsApp: +{currentTenant.whatsapp}</span>
            </p>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewAppointment}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cita</span>
          </button>
          <button
            onClick={() => setPublicTenantSlug(currentTenant.slug)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Página Pública</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${kpi.bg} flex flex-col justify-between transition-transform hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div>
                <p className={`text-xl font-extrabold ${kpi.color}`}>{kpi.count}</p>
                {kpi.subtitle && (
                  <p className="text-[10px] text-slate-500 font-semibold">{kpi.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Accesos Rápidos:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewAppointment}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-sky-600" />
            <span>Crear Cita</span>
          </button>
          <button
            onClick={() => setActiveView('customers')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Clientes</span>
          </button>
          <button
            onClick={() => setActiveView('services')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Servicios</span>
          </button>
          <button
            onClick={() => setActiveView('blocked')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            <span>Bloquear Horario</span>
          </button>
          <button
            onClick={() => setPublicTenantSlug(currentTenant.slug)}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Probar Formulario de Reserva</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Appointments & Popular Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Agenda para Hoy</h2>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={() => setActiveView('calendar')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center space-x-1"
            >
              <span>Ver en Calendario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Cargando agenda...</div>
          ) : todayAppointments.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">No hay citas registradas para hoy</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Las citas agendadas desde la web o manualmente aparecerán aquí.
              </p>
              <button
                onClick={onOpenNewAppointment}
                className="mt-3 px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium shadow-xs"
              >
                Crear Primera Cita
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="text-center px-2.5 py-1.5 bg-slate-100 rounded-lg flex-shrink-0">
                      <p className="text-xs font-bold text-slate-900">{apt.startTime}</p>
                      <p className="text-[10px] text-slate-500">{apt.endTime}</p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {apt.customerName}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          {apt.bookingCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{apt.serviceName}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {apt.staffName ? `Atiende: ${apt.staffName}` : 'Sin profesional asignado'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'pending' || apt.status === 'received'
                          ? 'bg-amber-100 text-amber-800'
                          : apt.status === 'in_progress'
                          ? 'bg-sky-100 text-sky-800'
                          : apt.status === 'completed'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Popular Services & Quick Insights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Servicios Más Solicitados</h2>
            <p className="text-xs text-slate-500">Demanda acumulada en el negocio</p>
          </div>

          {stats?.popularServices && stats.popularServices.length > 0 ? (
            <div className="space-y-3">
              {stats.popularServices.slice(0, 4).map((serv: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{serv.name}</p>
                    <p className="text-[11px] text-slate-500">{serv.count} reservas registradas</p>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    ${(serv.revenue || 0).toLocaleString()} {currentTenant.currency}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              Aún no hay suficientes datos para clasificar servicios.
            </p>
          )}

          {/* Quick Business Tips Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Reglas de Agendamiento Activas</span>
            </h4>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li>
                • Confirmación:{' '}
                <strong>
                  {currentTenant.autoConfirm ? 'Automática al agendar' : 'Manual por el administrador'}
                </strong>
              </li>
              <li>
                • Anticipación mínima: <strong>{currentTenant.advanceMinHours} horas</strong>
              </li>
              <li>
                • Límite para agendar a futuro: <strong>{currentTenant.advanceMaxDays} días</strong>
              </li>
              <li>
                • Cancelación sin penalidad: <strong>{currentTenant.cancelMinHours} horas antes</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          isOpen={!!selectedAppointment}
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdated={loadOverviewData}
        />
      )}
    </div>
  );
};

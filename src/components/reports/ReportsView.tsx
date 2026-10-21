import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { BarChart3, TrendingUp, CheckCircle, XCircle, Clock, DollarSign, Award } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { currentTenant } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (!currentTenant) return;
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await api.getStats(currentTenant.id);
        setStats(data);
      } catch (err) {
        console.error('Error loading reports stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [currentTenant, period]);

  if (!currentTenant) return null;

  const total = stats?.totalCount || 0;
  const completed = stats?.completedCount || 0;
  const confirmed = stats?.confirmedCount || 0;
  const cancelled = stats?.cancelledCount || 0;
  const pending = stats?.pendingCount || 0;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Reportes y Estadísticas de Negocio</h2>
          <p className="text-xs text-slate-500">
            Análisis de reservas, rendimiento de servicios y facturación estimada
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {(['today', 'week', 'month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === p ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'today' ? 'Hoy' : p === 'week' ? 'Esta Semana' : p === 'month' ? 'Este Mes' : 'Histórico'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total de Reservas
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Registradas en el período</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Tasa de Cumplimiento
          </span>
          <p className="text-2xl font-extrabold text-emerald-600">{completionRate}%</p>
          <p className="text-[11px] text-slate-400 mt-1">{completed} citas completadas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
            Tasa de Cancelación
          </span>
          <p className="text-2xl font-extrabold text-rose-600">{cancellationRate}%</p>
          <p className="text-[11px] text-slate-400 mt-1">{cancelled} canceladas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
            Ingresos Estimados
          </span>
          <p className="text-2xl font-extrabold text-indigo-600">
            ${((stats?.completedRevenue || 0) + (stats?.confirmedProjectedRevenue || 0)).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            ${(stats?.completedRevenue || 0).toLocaleString()} efectivamente realizados
          </p>
        </div>
      </div>

      {/* Services Performance Chart List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-sky-600" />
          <span>Distribución y Demanda por Servicio</span>
        </h3>

        {stats?.popularServices && stats.popularServices.length > 0 ? (
          <div className="space-y-4">
            {stats.popularServices.map((serv: any, i: number) => {
              const maxCount = stats.popularServices[0].count || 1;
              const percentage = Math.round((serv.count / maxCount) * 100);

              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{serv.name}</span>
                    <span className="text-slate-600">
                      {serv.count} citas • ${(serv.revenue || 0).toLocaleString()} {currentTenant.currency}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No hay datos en el período.</p>
        )}
      </div>
    </div>
  );
};

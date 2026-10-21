import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Customer } from '../../types';
import { buildWhatsAppLink } from '../../services/whatsapp';
import { Users, Search, MessageSquare, Phone, Mail, Calendar } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { currentTenant } = useApp();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const loadCustomers = async () => {
    if (!currentTenant) return;
    setLoading(true);
    try {
      const list = await api.getCustomers(currentTenant.id);
      setCustomers(list);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [currentTenant]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Directorio de Clientes</h2>
          <p className="text-xs text-slate-500">
            Registro automático de clientes que han agendado en tu empresa
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o celular..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando clientes...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">No hay clientes encontrados</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Los clientes se registran automáticamente cuando agendan una cita.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Reservas Totales</th>
                  <th className="py-3 px-4">Última Cita</th>
                  <th className="py-3 px-4">Notas</th>
                  <th className="py-3 px-4 text-right">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const waUrl = buildWhatsAppLink(
                    c.phone,
                    `Hola ${c.name}, te saludamos de ${currentTenant?.name}.`
                  );

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs flex-shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{c.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Registrado: {new Date(c.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <p className="font-medium">{c.phone}</p>
                        {c.email && <p className="text-[11px] text-slate-400">{c.email}</p>}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {c.totalBookings} {c.totalBookings === 1 ? 'cita' : 'citas'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {c.lastBookingAt ? (
                          new Date(c.lastBookingAt).toLocaleDateString()
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {c.notes || <span className="text-slate-300 italic">Sin notas</span>}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Contactar</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

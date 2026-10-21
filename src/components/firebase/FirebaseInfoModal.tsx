import React, { useState } from 'react';
import { Database, ShieldCheck, CheckCircle2, FileText, Code2, AlertCircle } from 'lucide-react';

export const FirebaseInfoModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'rules' | 'blueprint'>('status');

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Estado de Integración con Firebase</h2>
            <p className="text-xs text-slate-500">
              Arquitectura multiempresa preparada para Firestore y Firebase Authentication
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-5 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('status')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'status'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Estado y Variables de Entorno
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'rules'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Reglas de Seguridad (firestore.rules)
        </button>
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'blueprint'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Esquema de Datos (firebase-blueprint.json)
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-xs text-xs space-y-4">
        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2 text-sky-900">
              <div className="flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Motor de Persistencia y Bloqueo Atómico Activo</span>
              </div>
              <p className="text-xs leading-relaxed">
                El sistema cuenta con un motor backend transaccional con exclusión mutua (Mutex) que garantiza
                la prevención de dobles reservas en simultáneo, aislamiento multiempresa por <code className="font-mono bg-sky-100 px-1 py-0.5 rounded">tenantId</code>,
                y persistencia de datos reales en el servidor Express.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Configuración para Despliegue en Firebase Cloud:
              </h4>
              <p className="text-slate-600">
                Para conectar un proyecto de Firebase Firestore en producción, agrega en tu archivo <code className="font-mono bg-slate-100 px-1 rounded">firebase-applet-config.json</code> o variables de entorno:
              </p>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "apiKey": "AIzaSy...",
  "authDomain": "tu-proyecto.firebaseapp.com",
  "projectId": "tu-proyecto",
  "storageBucket": "tu-proyecto.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef",
  "firestoreDatabaseId": "(default)"
}`}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-slate-700">
              <h4 className="font-bold text-slate-900">Aislamiento de Datos por Tenant:</h4>
              <p>
                • Colecciones maestras estructuradas con campo indexado <code className="font-mono bg-white px-1 py-0.5 border rounded">tenantId</code>.
              </p>
              <p>
                • Ninguna empresa puede listar citas ni clientes de otra empresa.
              </p>
              <p>
                • Las reservas públicas se validan en el servidor antes de ser persistidas.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-3">
            <p className="text-slate-600">
              Las siguientes reglas de seguridad (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">firestore.rules</code>) fueron diseñadas siguiendo el estándar de control de acceso basado en atributos (ABAC), aislando tenants y restringiendo la creación de citas públicas a payloads validados:
            </p>
            <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    function isTenantAdmin(tenantId) {
      return request.auth != null && (
        exists(/databases/$(database)/documents/superadmins/$(request.auth.uid)) ||
        get(/databases/$(database)/documents/tenants/$(tenantId)/members/$(request.auth.uid)).data.role == 'tenant_admin'
      );
    }

    match /tenants/{tenantId} {
      allow get: if resource.data.status == 'active';
      allow update: if isTenantAdmin(tenantId);

      match /services/{serviceId} {
        allow get, list: if true;
        allow create, update, delete: if isTenantAdmin(tenantId);
      }

      match /appointments/{appointmentId} {
        allow create: if request.resource.data.tenantId == tenantId &&
          request.resource.data.customerName.size() <= 100;
        allow read, update, delete: if isTenantAdmin(tenantId);
      }
    }
  }
}`}
            </pre>
          </div>
        )}

        {activeTab === 'blueprint' && (
          <div className="space-y-3">
            <p className="text-slate-600">
              El archivo intermedio <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">firebase-blueprint.json</code> define rigurosamente los esquemas de Tenant, Service, Staff, Appointment, Customer y BlockedSlot:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1">
              <p>• <strong>Tenant:</strong> Datos corporativos, slug, sector, políticas y horarios.</p>
              <p>• <strong>Service:</strong> Duración, buffer, precio, modalidad y dynamicFields.</p>
              <p>• <strong>Staff:</strong> Profesionales asignados con sus turnos semanales.</p>
              <p>• <strong>Appointment:</strong> Snapshot inmutable de precio y duración, respuestas dinámicas.</p>
              <p>• <strong>Customer:</strong> Directorio CRM con frecuencia de reservas.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

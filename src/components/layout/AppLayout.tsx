import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';
import { OverviewView } from '../dashboard/OverviewView';
import { CalendarView } from '../calendar/CalendarView';
import { AppointmentsView } from '../appointments/AppointmentsView';
import { CustomersView } from '../customers/CustomersView';
import { ServicesView } from '../services/ServicesView';
import { StaffView } from '../staff/StaffView';
import { AvailabilityView } from '../availability/AvailabilityView';
import { BlockedSlotsView } from '../blocked/BlockedSlotsView';
import { PublicPageConfigView } from '../settings/PublicPageConfigView';
import { BusinessSettingsView } from '../settings/BusinessSettingsView';
import { ReportsView } from '../reports/ReportsView';
import { SuperAdminView } from '../superadmin/SuperAdminView';
import { FirebaseInfoModal } from '../firebase/FirebaseInfoModal';
import { NewAppointmentModal } from '../appointments/NewAppointmentModal';
import { TenantOnboardingModal } from '../onboarding/TenantOnboardingModal';
import { PublicBookingPage } from '../public/PublicBookingPage';

export const AppLayout: React.FC = () => {
  const {
    activeView,
    publicTenantSlug,
    setPublicTenantSlug,
    currentTenant,
    refreshTenants
  } = useApp();

  const [openNewAppointment, setOpenNewAppointment] = useState<boolean>(false);
  const [openOnboarding, setOpenOnboarding] = useState<boolean>(false);

  // If public booking page is active, show the customer-facing portal
  if (publicTenantSlug) {
    return (
      <PublicBookingPage
        tenantSlug={publicTenantSlug}
        onExitPreview={() => setPublicTenantSlug(null)}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Admin Sidebar */}
      <Sidebar onOpenNewAppointment={() => setOpenNewAppointment(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onOpenOnboarding={() => setOpenOnboarding(true)} />

        {/* View Container */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeView === 'overview' && (
              <OverviewView
                onOpenNewAppointment={() => setOpenNewAppointment(true)}
              />
            )}

            {activeView === 'calendar' && <CalendarView />}

            {activeView === 'appointments' && <AppointmentsView />}

            {activeView === 'customers' && <CustomersView />}

            {activeView === 'services' && <ServicesView />}

            {activeView === 'staff' && <StaffView />}

            {activeView === 'availability' && <AvailabilityView />}

            {activeView === 'blocked' && <BlockedSlotsView />}

            {activeView === 'public_page_config' && <PublicPageConfigView />}

            {activeView === 'business_settings' && <BusinessSettingsView />}

            {activeView === 'reports' && <ReportsView />}

            {activeView === 'superadmin' && (
              <SuperAdminView onOpenOnboarding={() => setOpenOnboarding(true)} />
            )}

            {activeView === 'firebase_info' && <FirebaseInfoModal />}
          </div>
        </main>
      </div>

      {/* Modals */}
      {openNewAppointment && (
        <NewAppointmentModal
          isOpen={openNewAppointment}
          onClose={() => setOpenNewAppointment(false)}
          onSuccess={() => {
            refreshTenants();
          }}
        />
      )}

      {openOnboarding && (
        <TenantOnboardingModal
          isOpen={openOnboarding}
          onClose={() => setOpenOnboarding(false)}
        />
      )}
    </div>
  );
};

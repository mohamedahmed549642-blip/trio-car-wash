import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, TabType } from './components/Navbar';
import { POSDashboard } from './components/POS/POSDashboard';
import { NewOrderModal } from './components/POS/NewOrderModal';
import { ReceiptModal } from './components/POS/ReceiptModal';
import { InventoryList } from './components/Inventory/InventoryList';
import { ShiftManager } from './components/Shifts/ShiftManager';
import { OrdersList } from './components/Orders/OrdersList';
import { ReportsDashboard } from './components/Analytics/ReportsDashboard';
import { WorkersManager } from './components/Workers/WorkersManager';
import { ServicesManager } from './components/Services/ServicesManager';
import { SettingsView } from './components/Settings/SettingsView';
import { LoginPage } from './components/Auth/LoginPage';
import { ToastContainer } from './components/UI/ToastContainer';
import { ServiceOrder } from './types';
import { Car, Heart } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    settings,
    isAuthenticated,
    activeUser,
    isAdmin,
    isDeveloperUnlocked,
    toasts,
    dismissToast,
  } = useApp();
  const isDev = isDeveloperUnlocked || activeUser.role === 'developer' || activeUser.username === 'developer';

  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [justCreatedOrder, setJustCreatedOrder] = useState<ServiceOrder | null>(null);

  const handleOrderCreated = (order: ServiceOrder) => {
    setJustCreatedOrder(order);
  };

  // If user is not authenticated, show dedicated Login Page with global toasts available
  if (!isAuthenticated) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <LoginPage />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      {/* Floating Animated Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'pos' && (
          <POSDashboard onOpenNewOrder={() => setIsNewOrderOpen(true)} />
        )}

        {activeTab === 'inventory' && <InventoryList />}

        {activeTab === 'shifts' && <ShiftManager />}

        {activeTab === 'orders' && <OrdersList />}

        {activeTab === 'reports' && <ReportsDashboard />}

        {activeTab === 'workers' && <WorkersManager />}

        {activeTab === 'services' && isAdmin && <ServicesManager />}

        {activeTab === 'settings' && isDev && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <img src="/logo.png" alt="Trio Logo" className="w-6 h-6 object-contain" />
            <span>{settings.shopName}</span>
            <span className="text-slate-400 font-normal">| {settings.slogan}</span>
          </div> 
        </div>
      </footer>

      {/* Global Modals */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <ReceiptModal
        order={justCreatedOrder}
        isOpen={!!justCreatedOrder}
        onClose={() => setJustCreatedOrder(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

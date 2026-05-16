'use client';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/admin/DashboardHome';
import Members from '../components/admin/Members';
import Plans from '../components/admin/Plans';
import Payments from '../components/admin/Payments';
import Trainers from '../components/admin/Trainers';
import PaymentModal from '../components/admin/Payments';

export type ActivePage = 'dashboard' | 'members' | 'plans' | 'payments';

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardHome />;
      case 'members': return <Members />;
      case 'plans': return <Plans />;
      case 'payments': return <PaymentModal/>;
      case 'trainers': return <Trainers />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {renderPage()}
      </main>
    </div>
  );
}
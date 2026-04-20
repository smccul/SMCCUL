/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import MemberDetail from './components/MemberDetail';
import ProfitCalculator from './components/ProfitCalculator';
import Reports from './components/Reports';
import Auth from './components/Auth';
import { Member } from './types';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    if (selectedMember) {
      return (
        <MemberDetail 
          member={selectedMember} 
          onBack={() => setSelectedMember(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return (
          <MemberList 
            onMemberClick={(member) => setSelectedMember(member)} 
          />
        );
      case 'add-member':
        return (
          <MemberForm 
            onSuccess={() => setActiveTab('members')} 
          />
        );
      case 'calculator':
        return <ProfitCalculator />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
}


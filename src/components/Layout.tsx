import React from 'react';
import { LayoutDashboard, Users, UserPlus, Calculator, FileText, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'members', label: 'সদস্য তালিকা', icon: Users },
    { id: 'add-member', label: 'সদস্য ভর্তি', icon: UserPlus },
    { id: 'calculator', label: 'হিসাব নিকেশ', icon: Calculator },
    { id: 'reports', label: 'রিপোর্টসমূহ', icon: FileText },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
            <Calculator className="w-8 h-8" />
            সমিতি ম্যানেজার
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {onLogout && (
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              লগ আউট
            </button>
          </div>
        )}
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <h1 className="text-lg font-bold text-indigo-700 font-sans">সমিতি ম্যানেজার</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white">
          <div className="p-6 pt-20">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg",
                    activeTab === item.id 
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 text-red-600 font-bold"
                >
                  <LogOut className="w-6 h-6" />
                  লগ আউট
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 min-w-0 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

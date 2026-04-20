import React from 'react';
import { TrendingUp, Users, Wallet, Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

export default function Dashboard() {
  // Mock data for initial design
  const stats = [
    { label: 'মোট সদস্য', value: '১২৪', icon: Users, color: 'bg-blue-500' },
    { label: 'মোট শেয়ার মূলধন', value: formatCurrency(500000), icon: Wallet, color: 'bg-emerald-500' },
    { label: 'মোট ঋণ বিতরণ', value: formatCurrency(250000), icon: Landmark, color: 'bg-orange-500' },
    { label: 'মোট সঞ্চয়', value: formatCurrency(150000), icon: TrendingUp, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">স্বাগতম!</h2>
        <p className="text-slate-500">আপনার সমিতির আজকের সারসংক্ষেপ এখানে দেখুন।</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={stat.color + " p-3 rounded-xl text-white"}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex items-center justify-center text-slate-400 italic">
          লেনদেনের গ্রাফ (শীঘ্রই আসছে)
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">সাম্প্রতিক লেনদেন</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">আব্দুর রহমান</p>
                    <p className="text-xs text-slate-500">সঞ্চয় জমা - ২০ এপ্রিল, ২০২৪</p>
                  </div>
                </div>
                <p className="font-bold text-slate-900 font-sans">+৳ ৫০০</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

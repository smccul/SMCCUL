import React from 'react';
import { Calculator, Percent, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function ProfitCalculator() {
  const [loanAmount, setLoanAmount] = React.useState<number>(1000);
  const [savingsAmount, setSavingsAmount] = React.useState<number>(10000);

  const loanInterest = (loanAmount / 1000) * 14;
  const savingsInterestAnnual = savingsAmount * 0.05;
  const savingsInterestMonthly = savingsInterestAnnual / 12;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">সুদ ও লাভ ক্যালকুলেটর</h2>
        <p className="text-slate-500">সমিতির নির্ধারিত হার অনুযায়ী হিসাব দেখে নিন।</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Loan Calculator */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">ঋণের সুদ (প্রতি মাস)</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">ঋণের পরিমাণ (৳)</label>
                <input 
                  type="number" 
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-sans font-bold text-xl outline-none focus:border-red-500"
                />
              </div>
              
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs font-bold text-red-500 uppercase mb-1">মাসিক সুদ</p>
                <h4 className="text-3xl font-bold text-red-700 font-sans">{formatCurrency(loanInterest)}</h4>
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> প্রতি ১০০০ টাকায় ১৪ টাকা হার।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Calculator */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">সঞ্চয় লাভ (৫% বার্ষিক)</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">সঞ্চয় স্থিতি (৳)</label>
                <input 
                  type="number" 
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-sans font-bold text-xl outline-none focus:border-emerald-500"
                />
              </div>
              
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-500 uppercase mb-1">মাসিক লাভ</p>
                    <h4 className="text-xl font-bold text-emerald-700 font-sans">{formatCurrency(savingsInterestMonthly)}</h4>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-500 uppercase mb-1">বার্ষিক লাভ</p>
                    <h4 className="text-xl font-bold text-emerald-700 font-sans">{formatCurrency(savingsInterestAnnual)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FDR Info Cards */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">মেয়াদী আমানত (FDR)</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">৩ বছর মেয়াদ</p>
                <p className="text-sm text-slate-500">প্রতি মাসে লাভ</p>
              </div>
              <p className="text-xl font-bold text-purple-700 font-sans">৳ ৮০০</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">৫ বছর মেয়াদ</p>
                <p className="text-sm text-slate-500">প্রতি মাসে লাভ</p>
              </div>
              <p className="text-xl font-bold text-purple-700 font-sans">৳ ৯০০</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { TrendingUp } from 'lucide-react';

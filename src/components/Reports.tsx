import React from 'react';
import { FileText, Download, TrendingUp, Calendar, ArrowRight, User } from 'lucide-react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member, Transaction } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

export default function Reports() {
  const [reportType, setReportType] = React.useState<'monthly' | 'yearly' | 'member'>('monthly');
  const [loading, setLoading] = React.useState(false);
  const [reportData, setReportData] = React.useState<any>(null);
  
  // Selection states
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [memberSearch, setMemberSearch] = React.useState('');
  const [foundMembers, setFoundMembers] = React.useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);

  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  async function searchMember(val: string) {
    setMemberSearch(val);
    if (val.length < 2) {
      setFoundMembers([]);
      return;
    }
    const q = query(collection(db, 'members'), where('memberId', '>=', val), where('memberId', '<=', val + '\uf8ff'));
    const snap = await getDocs(q);
    setFoundMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Member[]);
  }

  async function generateMonthlyReport() {
    setLoading(true);
    try {
      const allMembers = await getDocs(collection(db, 'members'));
      const txns: Transaction[] = [];
      
      for (const memberDoc of allMembers.docs) {
        const tSnap = await getDocs(collection(db, `members/${memberDoc.id}/transactions`));
        txns.push(...tSnap.docs.map(d => d.data() as Transaction));
      }

      const filtered = txns.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });

      const summary = {
        totalDeposit: filtered.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0),
        totalWithdraw: filtered.filter(t => t.type === 'WITHDRAWAL').reduce((sum, t) => sum + t.amount, 0),
        totalLoanRepay: filtered.filter(t => t.type === 'LOAN_REPAYMENT').reduce((sum, t) => sum + t.amount, 0),
        totalLoanDisburse: filtered.filter(t => t.type === 'LOAN_DISBURSE').reduce((sum, t) => sum + t.amount, 0),
        count: filtered.length
      };

      setReportData(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function generateMemberStatement() {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, `members/${selectedMember.id}/transactions`), orderBy('date', 'desc')));
      const txns = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      setReportData(txns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">রিপোর্ট ও স্টেটমেন্ট</h2>
        <p className="text-slate-500">প্রয়োজনীয় রিপোর্ট নির্বাচন করুন এবং জেনারেট করুন।</p>
      </header>

      <div className="flex gap-4 p-1 bg-slate-200 rounded-2xl w-fit">
        {(['monthly', 'member'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setReportType(t); setReportData(null); }}
            className={cn(
              "px-6 py-2 rounded-xl font-bold transition-all",
              reportType === t ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t === 'monthly' ? 'মাসিক রিপোর্ট' : 'সদস্য স্টেটমেন্ট'}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        {reportType === 'monthly' ? (
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-slate-600">মাস নির্বাচন করুন</label>
              <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-slate-600">বছর</label>
              <input 
                type="number" 
                value={selectedYear} 
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-sans"
              />
            </div>
            <button 
              onClick={generateMonthlyReport}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'লোড হচ্ছে...' : 'রিপোর্ট দেখুন'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <label className="text-sm font-bold text-slate-600 mb-2 block">সদস্য খুঁজুন (আইডি বা নাম)</label>
              <input 
                type="text" 
                value={memberSearch}
                onChange={e => searchMember(e.target.value)}
                placeholder="যেমন: ১০০১"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
              {foundMembers.length > 0 && !selectedMember && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl z-20 max-h-60 overflow-auto">
                  {foundMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedMember(m); setMemberSearch(m.name); setFoundMembers([]); }}
                      className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between border-b last:border-0"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500">আইডি: {m.memberId}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedMember && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg"><User className="text-indigo-600" /></div>
                  <div>
                    <p className="font-bold text-indigo-900">{selectedMember.name}</p>
                    <p className="text-xs text-indigo-600">আইডি: {selectedMember.memberId}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)} className="text-xs font-bold text-slate-500 hover:text-red-500">পরিবর্তন করুন</button>
              </div>
            )}
            <button 
              onClick={generateMemberStatement}
              disabled={loading || !selectedMember}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'প্রক্রিয়া চলছে...' : 'স্টেটমেন্ট বের করুন'}
            </button>
          </div>
        )}
      </div>

      {reportData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {reportType === 'monthly' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard label="মোট জমা" value={reportData.totalDeposit} color="text-emerald-600" bg="bg-emerald-50" />
              <SummaryCard label="মোট উত্তোলন" value={reportData.totalWithdraw} color="text-red-600" bg="bg-red-50" />
              <SummaryCard label="ঋণ বিতরণ" value={reportData.totalLoanDisburse} color="text-indigo-600" bg="bg-indigo-50" />
              <SummaryCard label="ঋণ আদায়" value={reportData.totalLoanRepay} color="text-emerald-600" bg="bg-emerald-50" />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
                <h3 className="font-bold text-slate-800">লেনদেন স্ট্যাটমেন্ট</h3>
                <button className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                  <Download className="w-4 h-4" /> ডাউনলোড (PDF)
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">মাস/তারিখ</th>
                      <th className="px-6 py-4">ধরণ</th>
                      <th className="px-6 py-4">বিবরণ</th>
                      <th className="px-6 py-4 text-right">পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reportData.map((txn: any) => (
                      <tr key={txn.id}>
                        <td className="px-6 py-4 text-sm">{formatDate(txn.date)}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            txn.type.includes('WITHDRAW') || txn.type.includes('DISBURSE') ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{txn.description}</td>
                        <td className={cn(
                          "px-6 py-4 text-right font-bold font-sans",
                          txn.type.includes('WITHDRAW') || txn.type.includes('DISBURSE') ? "text-red-600" : "text-emerald-600"
                        )}>
                          {formatCurrency(txn.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, bg }: any) {
  return (
    <div className={cn("p-6 rounded-2xl border border-slate-100 shadow-sm", bg)}>
      <p className="text-xs font-bold text-slate-500 uppercase mb-2">{label}</p>
      <h4 className={cn("text-2xl font-bold font-sans", color)}>{formatCurrency(value)}</h4>
    </div>
  );
}

import { cn } from '../lib/utils';

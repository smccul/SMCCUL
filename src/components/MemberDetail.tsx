import React from 'react';
import { 
  ArrowLeft, Wallet, Landmark, TrendingUp, PiggyBank, Briefcase, 
  Plus, History, DollarSign, Calculator, AlertCircle 
} from 'lucide-react';
import { 
  collection, query, onSnapshot, doc, getDoc, 
  setDoc, addDoc, updateDoc, increment, runTransaction 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member, Account, Transaction, AccountType } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
}

export default function MemberDetail({ member, onBack }: MemberDetailProps) {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddTxn, setShowAddTxn] = React.useState<{type: AccountType} | null>(null);

  React.useEffect(() => {
    const accountsRef = collection(db, `members/${member.id}/accounts`);
    const transactionsRef = collection(db, `members/${member.id}/transactions`);

    const unsubAccounts = onSnapshot(accountsRef, (snapshot) => {
      const accountData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Account[];
      setAccounts(accountData);
    });

    const unsubTxns = onSnapshot(query(transactionsRef), (snapshot) => {
      const txnData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      setTransactions(txnData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });

    return () => {
      unsubAccounts();
      unsubTxns();
    };
  }, [member.id]);

  async function handleTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!showAddTxn) return;

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const isWithdrawal = formData.get('txnType') === 'WITHDRAWAL' || formData.get('txnType') === 'LOAN_REPAYMENT';
    const finalAmount = isWithdrawal ? -amount : amount;
    
    try {
      await runTransaction(db, async (transaction) => {
        const accountId = showAddTxn.type;
        const accountRef = doc(db, `members/${member.id}/accounts`, accountId);
        const accountDoc = await transaction.get(accountRef);

        const currentBalance = accountDoc.exists() ? accountDoc.data().balance : 0;
        const newBalance = currentBalance + finalAmount;

        if (newBalance < 0 && showAddTxn.type !== 'LOAN') {
          throw new Error('অপর্যাপ্ত ব্যালেন্স!');
        }

        if (!accountDoc.exists()) {
          transaction.set(accountRef, {
            type: showAddTxn.type,
            balance: newBalance,
            lastInterestCalculated: new Date().toISOString()
          });
        } else {
          transaction.update(accountRef, { balance: newBalance });
        }

        const txnRef = doc(collection(db, `members/${member.id}/transactions`));
        transaction.set(txnRef, {
          memberId: member.id,
          accountId,
          type: formData.get('txnType'),
          amount: amount,
          date: new Date().toISOString(),
          description: formData.get('description')
        });
      });
      setShowAddTxn(null);
    } catch (err: any) {
      alert(err.message);
    }
  }

  const accountTypes: {type: AccountType, label: string, icon: any, color: string}[] = [
    { type: 'SHARE', label: 'শেয়ার অ্যাকাউন্ট', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50' },
    { type: 'SAVINGS', label: 'সঞ্চয় হিসাব (৫%)', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { type: 'DPS', label: 'ডিপিএস হিসাব', icon: PiggyBank, color: 'text-orange-600 bg-orange-50' },
    { type: 'FDR', label: 'মেয়াদী আমানত (FDR)', icon: Landmark, color: 'text-purple-600 bg-purple-50' },
    { type: 'LOAN', label: 'ঋণ হিসাব', icon: Calculator, color: 'text-red-600 bg-red-50' },
    { type: 'CHILD_SAVINGS', label: 'শিশু সঞ্চয়', icon: PiggyBank, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> ফিরে যান
      </button>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
            {member.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{member.name}</h2>
            <p className="text-slate-500 font-medium">আইডি: {member.memberId} • মোবাইল: {member.phone}</p>
          </div>
        </div>
        <div className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold">
          {member.status === 'active' ? 'সক্রিয় সদস্য' : 'নিষ্ক্রিয়'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountTypes.filter(at => member.isChild ? at.type === 'CHILD_SAVINGS' : at.type !== 'CHILD_SAVINGS').map((at) => {
          const acc = accounts.find(a => a.type === at.type);
          return (
            <div key={at.type} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", at.color)}>
                  <at.icon className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => setShowAddTxn({type: at.type})}
                  className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{at.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 font-sans">
                  {formatCurrency(acc?.balance || 0)}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-500" /> লেনদেনের ইতিহাস
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">মাস/তারিখ</th>
                <th className="px-6 py-4">ধরণ</th>
                <th className="px-6 py-4">অ্যাকাউন্ট</th>
                <th className="px-6 py-4">বিবরণ</th>
                <th className="px-6 py-4 text-right">পরিমাণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(txn.date)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                      txn.type === 'DEPOSIT' || txn.type === 'LOAN_REPAYMENT' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{txn.accountId}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{txn.description}</td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold font-sans",
                    txn.type === 'DEPOSIT' || txn.type === 'LOAN_REPAYMENT' ? "text-emerald-600" : "text-red-600"
                  )}>
                    {txn.type === 'DEPOSIT' || txn.type === 'LOAN_REPAYMENT' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">এখনও কোন লেনদেন হয়নি।</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showAddTxn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">লেনদেন যোগ করুন</h3>
                <button onClick={() => setShowAddTxn(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <Plus className="rotate-45 w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleTransaction} className="space-y-6">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Wallet className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-500 uppercase">অ্যাকাউন্ট</p>
                    <p className="font-bold text-indigo-900">{showAddTxn.type}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">লেনদেনের ধরণ</label>
                  <select 
                    name="txnType" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  >
                    {showAddTxn.type === 'LOAN' ? (
                      <>
                        <option value="LOAN_DISBURSE">ঋণ প্রদান</option>
                        <option value="LOAN_REPAYMENT">কিস্তি ফেরত</option>
                      </>
                    ) : (
                      <>
                        <option value="DEPOSIT">জমা দিন</option>
                        <option value="WITHDRAWAL">উত্তোলন করুন</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">টাকার পরিমাণ (৳)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    required 
                    autoFocus
                    placeholder="যেমন: ১০০০"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-2xl font-bold font-sans outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">বিবরণ</label>
                  <input 
                    type="text" 
                    name="description" 
                    placeholder="লেনদেনের সংক্ষিপ্ত নোট"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                >
                  লেনদেন নিশ্চিত করুন
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

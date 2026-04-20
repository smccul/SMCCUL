import React from 'react';
import { UserPlus, Calendar, Phone, MapPin, User, Baby } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member } from '../types';

interface MemberFormProps {
  onSuccess: () => void;
}

export default function MemberForm({ onSuccess }: MemberFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const memberData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      memberId: formData.get('memberId') as string,
      isChild: formData.get('isChild') === 'on',
      joinDate: new Date().toISOString(),
      status: 'active'
    };

    try {
      await addDoc(collection(db, 'members'), memberData);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'সদস্য ভর্তি করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
          <UserPlus className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">সদস্য ভর্তি ফরম</h2>
          <p className="text-slate-500">নতুন সদস্যর তথ্যগুলো নির্ভুলভাবে প্রদান করুন।</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> সদস্যর নাম
            </label>
            <input
              name="name"
              required
              type="text"
              placeholder="যেমন: মোঃ আব্দুল করিম"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> মোবাইল নাম্বার
            </label>
            <input
              name="phone"
              required
              type="tel"
              placeholder="০১৭xxxxxxxx"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="text-indigo-600 font-bold">#</span> সদস্য আইডি
            </label>
            <input
              name="memberId"
              required
              type="text"
              placeholder="যেমন: ১০০১"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> ভর্তির তারিখ
            </label>
            <input
              name="joinDate"
              required
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" /> ঠিকানা
          </label>
          <textarea
            name="address"
            rows={2}
            placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <input
            type="checkbox"
            name="isChild"
            id="isChild"
            className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isChild" className="text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
            <Baby className="w-5 h-5 text-indigo-500" /> এটি কি ‘শিশু সঞ্চয়’ হিসাবের সদস্য?
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? 'প্রক্রিয়া চলছে...' : 'সদস্য ভর্তি নিশ্চিত করুন'}
        </button>
      </form>
    </div>
  );
}

import React from 'react';
import { Search, ChevronRight, User, Phone, Calendar, ArrowUpRight } from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MemberListProps {
  onMemberClick: (member: Member) => void;
}

export default function MemberList({ onMemberClick }: MemberListProps) {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('memberId', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memberData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
      setMembers(memberData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.memberId.includes(searchTerm) ||
    m.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">সদস্য তালিকা</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="নাম, আইডি বা মোবাইল নাম্বার দিয়ে খুঁজুন"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-white rounded-3xl animate-pulse"></div>
          ))
        ) : filteredMembers.length > 0 ? (
          <AnimatePresence>
            {filteredMembers.map((member, i) => (
              <motion.button
                key={member.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onMemberClick(member)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all text-left group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                </div>
                
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold",
                    member.isChild ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                  )}>
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">
                      {member.name}
                      {member.isChild && <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] rounded-full">শিশু</span>}
                    </h3>
                    <p className="text-sm font-medium text-slate-500">আইডি: {member.memberId}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone className="w-3 h-3" />
                    {member.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(member.joinDate)}
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400">
            কোন সদস্য পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  );
}

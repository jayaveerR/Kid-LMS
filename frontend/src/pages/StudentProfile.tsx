import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Mail, Shield, Hash, Calendar, Loader2, Phone, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ fullName?: string; email?: string; _id?: string; totalExams?: number; avgScore?: number } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            setLoading(false);
            return;
        }
        const u = JSON.parse(storedUser);
        const targetId = u.id || u._id;
        
        try {
            const userRes = await fetch(`${API_BASE_URL}/api/users/${targetId}`);
            const userData = await userRes.json();
            
            // Fetch stats for profile
            const statsRes = await fetch(`${API_BASE_URL}/api/results?rollNumber=${targetId}`);
            const statsData = await statsRes.json();
            
            setUser({
              ...userData,
              totalExams: statsData.length,
              avgScore: statsData.length > 0 ? Math.round(statsData.reduce((a: number, b: { score: number; total: number }) => a + (b.score/b.total)*100, 0) / statsData.length) : 0
            });
        } catch (err) {
            console.error("Failed to load student profile:", err);
        } finally {
            setLoading(false);
        }
    };
    
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const info = [
    { label: 'Full Name Identity', value: user?.fullName || 'Student', icon: User },
    { label: 'Registered Email', value: user?.email, icon: Mail },
    { label: 'Student ID / UUID', value: user?._id || 'Not Assigned', icon: Hash },
    { label: 'Academic Status', value: 'Active Student', icon: Shield },
    { label: 'Avg Performance', value: `${user?.avgScore || 0}%`, icon: TrendingUp },
    { label: 'Total Assessments', value: `${user?.totalExams || 0} Finished`, icon: Calendar },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
           <div className="h-24 w-24 rounded-3xl bg-zinc-950 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-zinc-900/20 relative z-10 uppercase">
              {user?.fullName?.charAt(0) || 'S'}
           </div>
           <div className="text-center md:text-left relative z-10">
              <h1 className="text-3xl font-black tracking-tight text-zinc-950">{user?.fullName || 'Student'}</h1>
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1 bg-blue-50 px-3 py-1 rounded-full inline-block">Official Student Account</p>
           </div>
           
           <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full blur-3xl -translate-y-20 translate-x-20" />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {info.map((item, idx) => (
            <div key={idx} className="bg-white border border-border p-6 rounded-[2rem] flex items-center gap-5 hover:border-primary/40 transition-all group">
               <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <item.icon className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-zinc-950">{item.value}</p>
               </div>
            </div>
          ))}
        </motion.div>
        
        <div className="bg-zinc-950 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-500/10 border border-white/5">
           <div>
              <h3 className="text-xl font-bold">Need to update your details?</h3>
              <p className="text-zinc-400 text-sm mt-1">Please contact the administrator or your instructor for profile major modifications.</p>
           </div>
           <button className="bg-white text-zinc-950 px-8 py-3 rounded-2xl font-bold hover:bg-zinc-200 transition-all">Support Desk</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

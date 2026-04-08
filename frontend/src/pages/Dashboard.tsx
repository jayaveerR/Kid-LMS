import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, GraduationCap, FileText, CheckCircle, TrendingUp, Loader2, Upload } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Students', value: '0', icon: GraduationCap, change: '0%' },
    { label: 'Instructors', value: '0', icon: Users, change: '0%' },
    { label: 'Total Exams', value: '0', icon: FileText, change: '0%' },
    { label: 'Evaluated', value: '0', icon: CheckCircle, change: '0%' },
  ]);
  const [recentEvals, setRecentEvals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from Node.js API
    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Stats
            const statsRes = await fetch(`${API_BASE_URL}/api/stats`);
            const statsData = await statsRes.json();
            
            // 2. Fetch Recent Results
            const resultsRes = await fetch(`${API_BASE_URL}/api/results`);
            const resultsData = await resultsRes.json();

            setStats([
                { label: 'Total Students', value: statsData.students?.toString() || '0', icon: GraduationCap, change: '+12%' },
                { label: 'Instructors', value: statsData.instructors?.toString() || '0', icon: Users, change: '+2%' },
                { label: 'Total Exams', value: statsData.exams?.toString() || '0', icon: FileText, change: '+5%' },
                { label: 'Evaluated', value: statsData.evaluations?.toString() || '0', icon: CheckCircle, change: '+18%' },
            ]);

            setRecentEvals(resultsData.slice(0, 5).map((d: any) => ({
                id: d._id,
                student: d.rollNumber || 'Unknown',
                exam: d.examTitle || 'Exam',
                score: `${d.score}/${d.total}`,
                status: 'Completed'
            })));

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading overview...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">System Overview</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-wider bg-zinc-100 w-fit px-2 py-0.5 rounded">Administrator Portal</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-border shadow-sm">
             <button className="px-4 py-2 text-sm font-medium bg-zinc-950 text-white rounded-lg">Last 30 Days</button>
             <button className="px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 rounded-lg">Realtime</button>
          </div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="group relative overflow-hidden rounded-3xl border border-border bg-white p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 transition-colors group-hover:bg-primary/10">
                  <stat.icon className="h-6 w-6 text-zinc-950 transition-colors group-hover:text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h3 className="text-4xl font-black tabular-nums tracking-tight text-zinc-950">{stat.value}</h3>
                </div>
              </div>
              {/* Decorative Background Icon */}
              <stat.icon className="absolute -bottom-6 -right-6 h-32 w-32 text-zinc-50/50 -rotate-12 transition-transform group-hover:scale-110 group-hover:text-primary/5" />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-zinc-950">Recent Results</h3>
              <button className="text-sm font-semibold text-primary hover:underline" onClick={() => window.location.href='/all-evaluations'}>View All Reports</button>
            </div>
            <div className="space-y-4">
              {recentEvals.length === 0 ? (
                <div className="py-20 text-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-3xl">
                  No evaluations found.
                </div>
              ) : (
                recentEvals.map((evaluation) => (
                  <div key={evaluation.id} className="group flex items-center justify-between rounded-2xl border border-zinc-100 p-4 transition-all hover:bg-zinc-50 hover:border-zinc-200">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white text-xs font-bold ring-4 ring-zinc-50">
                        {evaluation.student.slice(-2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-950">{evaluation.student}</p>
                        <p className="text-xs text-zinc-500">{evaluation.exam} Assessment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-zinc-950">{evaluation.score}</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{evaluation.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-zinc-200 bg-zinc-950 p-8 shadow-xl text-white relative overflow-hidden"
          >
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
               <div className="space-y-3">
                 <button className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all border border-white/5 flex items-center justify-between group" onClick={() => window.location.href='/manage-users'}>
                   <div>
                     <p className="font-bold">Add Student</p>
                     <p className="text-xs text-zinc-400">Enroll new learners</p>
                   </div>
                   <Users className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all" />
                 </button>
                 <button className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all border border-white/5 flex items-center justify-between group" onClick={() => window.location.href='/manage-exams'}>
                   <div>
                     <p className="font-bold">New Exam</p>
                     <p className="text-xs text-zinc-400">Create target papers</p>
                   </div>
                   <FileText className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all" />
                 </button>
                 <button className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl text-left transition-all shadow-lg shadow-blue-600/20 mt-4 font-bold flex items-center justify-center gap-2" onClick={() => window.location.href='/upload'}>
                   <Upload className="w-4 h-4" /> Start Evaluation
                 </button>
               </div>
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/30 rounded-full blur-3xl -translate-y-10 translate-x-10" />
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/20 rounded-full blur-3xl translate-y-10 -translate-x-10" />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

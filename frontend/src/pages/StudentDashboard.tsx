import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GraduationCap, BarChart3, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Student');
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: 'Total Exams', value: '0', icon: GraduationCap },
    { label: 'Results Out', value: '0', icon: BarChart3 },
    { label: 'Pending', value: '0', icon: Clock },
    { label: 'Avg Score', value: '0%', icon: TrendingUp },
  ]);

  useEffect(() => {
    // Check localStorage for student details (Node.js Auth)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.fullName || 'Student');

        const fetchStudentData = async () => {
            try {
                // Fetch results filtered by rollNumber (which might be the email in this case or a specific ID)
                // Assuming user.email is used as identifier for now
                // Use UUID as primary identifier for results
                const targetRoll = user.id || user._id || user.email;
                const res = await fetch(`${API_BASE_URL}/api/results?rollNumber=${targetRoll}`);
                const data = await res.json();
                setResultsData(data);

                // Calculate Table Stats
                const totalExams = data.length;
                const evaluated = data.length;
                const pending = 0;
                const scores = data.map((r: any) => (r.score / r.total) * 100);
                const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

                setStats([
                    { label: 'Total Exams', value: String(totalExams), icon: GraduationCap },
                    { label: 'Results Out', value: String(evaluated), icon: BarChart3 },
                    { label: 'Pending', value: String(pending), icon: Clock },
                    { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp },
                ]);

            } catch (err) {
                console.error("Failed to load student dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    } else {
        setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-widest bg-zinc-100 w-fit px-2 py-0.5 rounded">Student Learning Portal</p>
          </div>
          <div className="bg-white p-1 rounded-xl border border-border shadow-sm flex items-center">
             <div className="px-4 py-2 text-xs font-bold text-zinc-400">TERM PROGRESS:</div>
             <div className="w-32 h-2 bg-zinc-100 rounded-full mr-4 overflow-hidden">
                <div className="h-full bg-blue-600 w-2/3 shadow-sm shadow-blue-600/20" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group rounded-3xl border border-border bg-white p-6 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 transition-colors group-hover:bg-primary/10">
                  <stat.icon className="h-6 w-6 text-zinc-950 transition-colors group-hover:text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-950 tabular-nums">{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-zinc-950">Recent Assessment Results</h3>
            <button className="text-sm font-semibold text-primary hover:underline">Download All Report</button>
          </div>
          <div className="space-y-4">
            {resultsData.length === 0 ? (
              <div className="py-20 text-center text-zinc-400 bg-zinc-50/50 border-2 border-dashed border-zinc-100 rounded-3xl">
                 <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                 No assessment results available.
              </div>
            ) : (
                resultsData.map((result) => (
                  <div key={result._id} className="group flex items-center justify-between rounded-2xl border border-zinc-100 p-5 transition-all hover:bg-zinc-50 hover:border-zinc-200">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white font-bold ring-4 ring-zinc-50 transition-transform group-hover:scale-105">
                        {result.grade || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-950">{result.examTitle || 'Semester Exam'}</p>
                        <p className="text-xs text-zinc-500 font-medium italic">Evaluation completed on {new Date(result.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-zinc-950 tabular-nums leading-none mb-1">{result.score}/{result.total}</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Evaluated</p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

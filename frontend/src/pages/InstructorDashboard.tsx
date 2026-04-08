import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, Users, FileText, CheckCircle, Loader2, ArrowRight, Upload as UploadIcon, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/constants';

export default function InstructorDashboard() {
  const [stats, setStats] = useState([
    { label: 'My Subjects', value: '0', icon: BookOpen },
    { label: 'Total Students', value: '0', icon: Users },
    { label: 'Total Exams', value: '0', icon: FileText },
    { label: 'Evaluated', value: '0', icon: CheckCircle },
  ]);
  const [recentEvals, setRecentEvals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstructorData() {
        try {
            const statsRes = await fetch(`${API_BASE_URL}/api/stats`);
            const statsData = await statsRes.json();
            
            const resultsRes = await fetch(`${API_BASE_URL}/api/results`);
            const resultsData = await resultsRes.json();

            setStats([
                { label: 'Total Subjects', value: statsData.exams?.toString() || '0', icon: BookOpen },
                { label: 'Total Students', value: statsData.students?.toString() || '0', icon: Users },
                { label: 'Total Exams', value: statsData.exams?.toString() || '0', icon: FileText },
                { label: 'Evaluated', value: statsData.evaluations?.toString() || '0', icon: CheckCircle },
            ]);

            setRecentEvals(resultsData.slice(0, 5).map((d: any) => ({
                id: d._id,
                title: `${d.examTitle} - ${d.rollNumber}`,
                time: new Date(d.timestamp).toLocaleTimeString(),
                status: 'Completed'
            })));

        } catch (err) {
            console.error("Failed to load instructor dashboard:", err);
        } finally {
            setLoading(false);
        }
    }
    fetchInstructorData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-bold">Initializing Instructor Portal...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Instructor Console</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your courses, assessments and student evaluations.</p>
          </div>
          <div className="flex items-center gap-3">
             <Link to="/upload">
                <Button className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-12 px-6">
                  <UploadIcon className="mr-2 h-4.5 w-4.5" /> Start New Evaluation
                </Button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-zinc-950 px-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Recent Activity
            </h3>
            <div className="grid gap-4">
              {recentEvals.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/50">
                    No recent evaluations found.
                </div>
              ) : (
                recentEvals.map((evaluation) => (
                  <div key={evaluation.id} className="group bg-white flex items-center justify-between rounded-2xl border border-zinc-100 p-5 transition-all hover:bg-zinc-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-zinc-950 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-950">{evaluation.title}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-1">{evaluation.time}</p>
                      </div>
                    </div>
                    <Link to={`/all-evaluations`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="rounded-xl h-9 font-bold bg-zinc-100">
                        View Report <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
             <h3 className="text-xl font-bold mb-6">Quick Links</h3>
             <div className="space-y-3">
               <Link to="/manage-exams" className="block w-full p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-zinc-400 group-hover:text-blue-600" />
                    <div>
                      <p className="text-sm font-bold">Manage Exams</p>
                      <p className="text-[10px] text-zinc-400 font-medium">Create and edit papers</p>
                    </div>
                  </div>
               </Link>
               <Link to="/manage-subjects" className="block w-full p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-zinc-400 group-hover:text-amber-500" />
                    <div>
                      <p className="text-sm font-bold">Course Catalog</p>
                      <p className="text-[10px] text-zinc-400 font-medium">Update subject details</p>
                    </div>
                  </div>
               </Link>
               <Link to="/instructor-students" className="block w-full p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-zinc-400 group-hover:text-purple-600" />
                    <div>
                      <p className="text-sm font-bold">Student Roster</p>
                      <p className="text-[10px] text-zinc-400 font-medium">View enrollment list</p>
                    </div>
                  </div>
               </Link>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

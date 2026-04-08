import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Trophy, BarChart3, Award, Loader2, Download, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default function StudentResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);
      const userRole = user.role || 'student';

      try {
        let url = `${API_BASE_URL}/api/results`;
        if (userRole === 'student') {
          url += `?rollNumber=${user.email}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        const formattedData = data.map((d: any) => ({
          _id: d._id,
          exam: d.examTitle || 'Semester Exam',
          student: d.rollNumber || 'N/A',
          date: d.timestamp ? new Date(d.timestamp).toLocaleDateString() : 'N/A',
          marks: `${d.score}/${d.total}`,
          pct: d.total ? ((d.score / d.total) * 100).toFixed(0) : '0',
          grade: (d.score / (d.total || 100)) >= 0.8 ? 'A+' : (d.score / (d.total || 100)) >= 0.6 ? 'B' : 'C'
        }));
        
        setResults(formattedData);
      } catch (err) {
        console.error("Failed to fetch results:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  const stats = [
    { label: 'Total Assessments', value: results.length.toString(), icon: BarChart3 },
    { label: 'Avg Performance', value: results.length > 0 ? (results.reduce((acc, r) => acc + parseInt(r.pct), 0) / results.length).toFixed(0) + '%' : '0%', icon: Trophy },
    { label: 'Highest Score', value: results.length > 0 ? Math.max(...results.map(r => parseInt(r.pct))) + '%' : '0%', icon: Award },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-bold tracking-tight">Syncing Result Ledger...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="bg-zinc-950 p-8 lg:p-12 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-blue-600/10 border border-white/5">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight tracking-tight">Academic Performance</h1>
              <p className="text-zinc-400 font-medium max-w-md">Detailed breakdown of your assessment metrics and examination history.</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl min-w-[140px] shadow-sm">
                   <div className="flex items-center gap-3 mb-2">
                      <stat.icon className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</span>
                   </div>
                   <p className="text-2xl font-black tabular-nums">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl translate-y-10 -translate-x-10" />
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-zinc-400">Examination Subject</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-zinc-400">Student Roll</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-zinc-400">Date Taken</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-zinc-400">Grade</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-zinc-400">Scores</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-zinc-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <BarChart3 className="w-16 h-16 mx-auto text-zinc-100 mb-4" />
                      <p className="text-zinc-500 font-bold">No academic records found.</p>
                    </td>
                  </tr>
                ) : (
                  results.map((result) => (
                    <tr key={result._id} className="group hover:bg-zinc-50/50 transition-all">
                      <td className="p-6">
                        <p className="text-sm font-black text-zinc-950 group-hover:text-primary transition-colors">{result.exam}</p>
                      </td>
                      <td className="p-6 text-sm text-zinc-500 font-bold">{result.student}</td>
                      <td className="p-6 text-sm text-zinc-400">{result.date}</td>
                      <td className="p-6">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-black ring-4 ring-zinc-50 ${
                          result.grade === 'A+' ? 'bg-emerald-500 text-white' : 
                          result.grade === 'B' ? 'bg-blue-500 text-white' : 
                          'bg-zinc-950 text-white'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                           <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                             <span>SCORE: {result.marks}</span>
                             <span>{result.pct}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${parseInt(result.pct) > 80 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                style={{ width: `${result.pct}%` }} 
                              />
                           </div>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <Button variant="ghost" size="sm" className="h-10 rounded-xl font-bold bg-zinc-50 hover:bg-primary hover:text-white transition-all hover:scale-105" onClick={() => window.location.href=`/result-detail/${result._id}`}>
                          View Details <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { useParams } from 'react-router-dom';
import { Trophy, BarChart3, Award, Search, Eye, Loader2, Download, TrendingUp, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StudentMyResults() {
  const { rollNumber: urlRollNumber } = useParams();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{ id: string; examTitle: string; percentage: number; score: number; totalMarks: number; date: string; grade: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingAs, setViewingAs] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      let targetRollNumber = urlRollNumber;
      
      if (!targetRollNumber) {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setLoading(false);
          return;
        }
        const user = JSON.parse(storedUser);
        targetRollNumber = user.id || user._id || user.email;
      } else {
        setViewingAs(targetRollNumber);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/results?rollNumber=${targetRollNumber}`);
        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        
        // Map data to expected frontend structure
        const mapped = data.map((r: { _id: string; examTitle?: string; total?: number; score: number; timestamp?: string; grade?: string }) => ({
            id: r._id,
            examTitle: r.examTitle || 'Final Assessment',
            percentage: r.total ? Math.round((r.score / r.total) * 100) : 0,
            score: r.score,
            totalMarks: r.total,
            date: r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'N/A',
            grade: r.grade || 'C'
        }));
        
        setResults(mapped);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load your assessment history');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [urlRollNumber]);

  const filtered = results.filter(r =>
    (r.examTitle || '').toLowerCase().includes(search.toLowerCase())
  );

  // Calculate stats from real data
  const totalExams = results.length;
  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length)
    : 0;
  const bestScore = results.length > 0
    ? Math.max(...results.map(r => r.percentage))
    : 0;

  const stats = [
    { label: 'Completed', value: totalExams.toString(), icon: BarChart3 },
    { label: 'Avg Performance', value: `${avgScore}%`, icon: Trophy },
    { label: 'Highest Pct', value: `${bestScore}%`, icon: Award },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-zinc-500 font-bold tracking-tighter animate-pulse">Syncing Result Ledger...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        {viewingAs && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-600/20"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 opacity-80" />
              <p className="text-sm font-bold">Admin View: Browsing results for <span className="underline italic">{viewingAs}</span></p>
            </div>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 font-bold" onClick={() => window.history.back()}>
              Exit View
            </Button>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-600/10 border border-white/5">
           <div className="relative z-10">
              <h1 className="text-3xl font-black tracking-tight">Your Academic Ledger</h1>
              <p className="text-zinc-400 font-medium mt-1">Review your automated evaluation history and scoring metrics.</p>
           </div>
           
           <div className="flex gap-4 relative z-10 flex-wrap">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl min-w-[140px] shadow-sm group hover:border-blue-600/30 transition-all">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</span>
                      <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                   </div>
                   <p className="text-2xl font-black tabular-nums">{stat.value}</p>
                </div>
              ))}
           </div>
           
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
        </div>

        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder="Search within your assessment results..." 
            className="pl-14 bg-white border-zinc-200 rounded-[1.5rem] h-16 text-lg shadow-sm focus-visible:ring-blue-600/10 font-bold transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-zinc-100 rounded-[3rem] bg-zinc-50/20">
               <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-zinc-300" />
               </div>
               <p className="text-xl font-bold text-zinc-400">No results found matching your search.</p>
            </div>
          ) : (
            filtered.map((result) => (
                <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={result.id}
                className="group relative bg-white border border-border rounded-[2.5rem] p-8 shadow-sm hover:border-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/5 transition-all overflow-hidden"
                >
                    <div className="flex items-start justify-between relative z-10 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-zinc-950 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-zinc-900/20 group-hover:bg-blue-600 transition-colors uppercase">
                                {result.examTitle.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-950 group-hover:text-blue-600 transition-colors">{result.examTitle}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1 italic">Evaluation completed on {result.date}</p>
                            </div>
                        </div>
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg font-black ring-4 ring-zinc-50 ${
                            result.grade === 'A' ? 'bg-emerald-500 text-white' : 
                            result.grade === 'B' ? 'bg-blue-600 text-white' : 
                            'bg-zinc-950 text-white'
                        }`}>
                            {result.grade}
                        </div>
                    </div>

                    <div className="bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100 relative z-10">
                        <div className="flex items-baseline justify-between mb-3">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Composite Score</p>
                            <p className="text-2xl font-black text-zinc-950">{result.percentage}% <span className="text-sm font-medium text-zinc-400">/ 100</span></p>
                        </div>
                        <div className="h-2.5 w-full bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.percentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full transition-all ${result.percentage >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_#10b98150]' : 'bg-blue-600 shadow-[0_0_10px_#2563eb50]'}`}
                            />
                        </div>
                        <div className="flex justify-between mt-4 text-[11px] font-bold text-zinc-450 px-1">
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                                <span>TOTAL MARKS: {result.score} / {result.totalMarks}</span>
                            </div>
                            <span className="text-emerald-600 uppercase">PROCESSED SUCCESSFULLY</span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3 relative z-10">
                        <Button variant="ghost" size="sm" className="rounded-xl h-11 font-bold border-zinc-200 hover:bg-zinc-100 px-6 active:scale-95 transition-all">
                           <Download className="w-4 h-4 mr-2" /> PDF Report
                        </Button>
                        <Button className="rounded-xl h-11 font-bold bg-zinc-950 text-white hover:bg-zinc-800 px-8 shadow-lg shadow-zinc-900/10 active:scale-95 transition-all" onClick={() => window.location.href=`/result-detail/${result.id}`}>
                           Details <Eye className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

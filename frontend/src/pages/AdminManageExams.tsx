import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar, Clock, FileText, Eye, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface Exam {
  _id: string;
  title: string;
  subject: string;
  date: string;
  duration: string;
  questions: number;
  status: string;
}

export default function AdminManageExams() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newExam, setNewExam] = useState({
    title: '',
    subject: '',
    date: '',
    duration: '',
    questions: 10,
    status: 'Upcoming'
  });

  const fetchExams = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/exams`);
        const data = await response.json();
        setExams(data);
    } catch (err) {
        toast.error("Failed to load exams");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExam,
          date: new Date(newExam.date).toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to save exam');

      toast.success('Examination created successfully in MongoDB Atlas');
      setIsDialogOpen(false);
      setNewExam({ title: '', subject: '', date: '', duration: '', questions: 10, status: 'Upcoming' });
      fetchExams(); // Refresh list

    } catch (error) {
      toast.error('Failed to create examination');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Examination Management</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Create, schedule and oversee assessment papers.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-12 px-6 shadow-lg shadow-zinc-950/10">
                <Plus className="mr-2 h-4.5 w-4.5" /> Schedule New Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New Examination</DialogTitle>
                <DialogDescription>Define the core details of the assessment paper.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveExam} className="space-y-5 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Exam Title</Label>
                    <Input id="title" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} placeholder="Final Assessment 2024" required className="rounded-xl h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={newExam.subject} onChange={e => setNewExam({...newExam, subject: e.target.value})} placeholder="Mathematics" required className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Scheduled Date</Label>
                      <Input id="date" type="date" value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} required className="rounded-xl h-11" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (mins)</Label>
                      <Input id="duration" type="number" value={newExam.duration} onChange={e => setNewExam({...newExam, duration: e.target.value})} placeholder="120" required className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="questions">Questions Count</Label>
                      <Input id="questions" type="number" value={newExam.questions} onChange={e => setNewExam({...newExam, questions: parseInt(e.target.value)})} placeholder="10" required className="rounded-xl h-11" />
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-4 gap-3 flex-col sm:flex-row">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 order-2 sm:order-1">Cancel</Button>
                  <Button type="submit" disabled={isSaving} className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl h-11 order-1 sm:order-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Exam
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search examinations by title or subject..." 
            className="pl-12 bg-white border-border rounded-3xl h-14 text-base shadow-sm focus:ring-primary/20 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">Syncing Examinations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <motion.div
                key={exam._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white rounded-3xl border border-border p-6 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-zinc-950 p-2.5 rounded-2xl">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {exam.status || 'Active'}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-zinc-950 group-hover:text-primary transition-colors">{exam.title}</h3>
                <p className="text-sm text-zinc-500 mt-1">{exam.subject}</p>

                <div className="mt-6 flex items-center justify-between pt-6 border-t border-zinc-100">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-600 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs">{new Date(exam.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">{exam.duration} mins</span>
                      </div>
                   </div>
                   <Button variant="ghost" size="sm" className="rounded-xl h-9 hover:bg-zinc-50 font-bold" onClick={() => window.location.href=`/model-answers?examId=${exam._id}`}>
                     <Eye className="mr-2 h-3.5 w-3.5" /> View Key
                   </Button>
                </div>
              </motion.div>
            ))}

            {filteredExams.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
                <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium tracking-tight">No examinations matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

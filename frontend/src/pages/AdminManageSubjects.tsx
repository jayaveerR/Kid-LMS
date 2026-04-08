import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Loader2, Save, BookOpen, ExternalLink } from 'lucide-react';
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

interface Subject {
  _id: string;
  code: string;
  name: string;
  description: string;
}

export default function AdminManageSubjects() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    description: ''
  });

  const fetchSubjects = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subjects`);
        const data = await response.json();
        setSubjects(data);
    } catch (err) {
        toast.error("Failed to load subjects");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });

      if (!response.ok) throw new Error('Failed to save subject');

      toast.success('Subject created successfully in MongoDB Atlas');
      setIsDialogOpen(false);
      setNewSubject({ code: '', name: '', description: '' });
      fetchSubjects();

    } catch (error) {
      toast.error('Failed to create subject');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Subject Directory</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-widest bg-zinc-100 w-fit px-2 py-0.5 rounded">Course Catalog</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-12 px-6 shadow-lg shadow-zinc-950/10">
                <Plus className="mr-2 h-4.5 w-4.5" /> Define New Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New Subject</DialogTitle>
                <DialogDescription>Add a new course or subject to the catalog.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveSubject} className="space-y-5 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sname">Subject Name</Label>
                    <Input id="sname" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} placeholder="Machine Learning" required className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scode">Subject Code</Label>
                    <Input id="scode" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} placeholder="CSL-401" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sdesc">Description (Optional)</Label>
                    <Input id="sdesc" value={newSubject.description} onChange={e => setNewSubject({...newSubject, description: e.target.value})} placeholder="Brief overview of the course content" className="rounded-xl h-11" />
                  </div>
                </div>
                <DialogFooter className="pt-4 gap-3 flex-col sm:flex-row">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 order-2 sm:order-1 font-semibold">Cancel</Button>
                  <Button type="submit" disabled={isSaving} className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl h-11 order-1 sm:order-2 font-bold px-8">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Subject
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
          <Input 
            placeholder="Search subjects by name or course code..." 
            className="pl-14 bg-white border-zinc-200 rounded-3xl h-14 text-base shadow-sm focus:ring-primary/20 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">Syncing Subject Catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <motion.div
                key={subject._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-white rounded-3xl border border-border p-8 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all text-center flex flex-col items-center"
              >
                <div className="bg-zinc-50 h-20 w-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors border border-zinc-100 group-hover:border-primary/20">
                    <BookOpen className="h-8 w-8 text-zinc-950 group-hover:text-primary transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-zinc-950 mb-1 group-hover:text-primary transition-colors">{subject.name}</h3>
                <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">{subject.code || 'NO-CODE'}</p>
                <p className="text-sm text-zinc-500 mb-8 line-clamp-2 px-2 italic font-medium">{subject.description || 'No description provided for this subject.'}</p>

                <div className="mt-auto pt-6 border-t border-zinc-100 w-full flex items-center justify-center gap-4">
                   <Button variant="ghost" size="sm" className="rounded-xl h-10 hover:bg-zinc-50 font-bold transition-all hover:gap-3">
                     View Details <ExternalLink className="ml-2 h-3.5 w-3.5" />
                   </Button>
                </div>
              </motion.div>
            ))}

            {filteredSubjects.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
                <BookOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">No subjects found matching your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Search, Copy, Check, Loader2, Mail, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InstructorStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        // Map backend users and filter for students
        const filtered = data
            .filter((u: any) => u.role === 'student' || !u.role)
            .map((s: any) => ({
                id: s._id,
                email: s.email || 'No Email',
                displayName: s.fullName || s.name || s.email?.split('@')[0] || 'Unknown Student'
            }));

        setStudents(filtered);
      } catch (err) {
        console.error("Error fetching students:", err);
        toast.error("Could not sync student list from secure server.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('UUID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight">Student Directory</h1>
            <p className="text-zinc-500 font-medium mt-1">Unified roster of all enrolled learners and their identifiers.</p>
          </div>
          <div className="bg-zinc-50 px-5 py-3 rounded-2xl border border-zinc-100 flex items-center gap-3">
             <Users className="w-5 h-5 text-blue-600" />
             <div className="text-left">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Total Enrolled</p>
                <p className="text-xl font-black text-zinc-950">{students.length}</p>
             </div>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 transition-colors group-focus-within:text-blue-600" />
          <Input 
            placeholder="Filter students by name, email or secure UUID..." 
            className="pl-12 bg-white border-zinc-200 rounded-2xl h-14 text-lg shadow-sm focus-visible:ring-blue-600/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={student.id}
              className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-600/20 transition-all group overflow-hidden relative"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-950 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-zinc-950/20 group-hover:bg-blue-600 transition-colors">
                    {student.displayName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">{student.displayName}</h3>
                    <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                      <Mail className="w-3.5 h-3.5 outline-none" />
                      <span className="text-xs font-semibold">{student.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                   <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                      <Hash className="w-3.5 h-3.5 text-zinc-400" />
                   </div>
                   <div className="text-left overflow-hidden max-w-[150px]">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Student Identifier</p>
                      <p className="text-xs font-bold text-zinc-600 truncate">{student.id}</p>
                   </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/view-results/${student.email}`;
                    }}
                    className="rounded-xl hover:bg-zinc-100 font-bold px-4"
                  >
                    View Results
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(student.id)}
                    className="rounded-xl hover:bg-blue-50 hover:text-blue-600 font-bold px-4"
                  >
                    {copiedId === student.id ? (
                      <><Check className="h-3.5 w-3.5 mr-2" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5 mr-2" /> Copy UUID</>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl -translate-y-16 translate-x-16" />
            </motion.div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
               <Users className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
               <p className="text-zinc-500 font-bold tracking-tight">No students found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

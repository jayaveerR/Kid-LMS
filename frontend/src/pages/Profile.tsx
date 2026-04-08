import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, Phone, Hash, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';

interface UserProfileData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  rollNumber?: string;
  assignedExams?: number;
  totalEvaluations?: number;
  createdAt?: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    rollNumber: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
          setLoading(false);
          return;
      }
      const user = JSON.parse(storedUser);
      const targetId = user.id || user._id;
      
      try {
          const response = await fetch(`${API_BASE_URL}/api/users/${targetId}`);
          const data = await response.json();
          
          let additionalStats = {};
          if (data.role === 'instructor' || data.role === 'admin') {
              const statsRes = await fetch(`${API_BASE_URL}/api/stats`);
              const statsData = await statsRes.json();
              additionalStats = {
                  assignedExams: statsData.exams || 0,
                  totalEvaluations: statsData.evaluations || 0
              };
          }

          setUserData({ ...data, ...additionalStats });
          setFormData({
            fullName: data.fullName || '',
            phone: data.phone || '',
            rollNumber: data.rollNumber || ''
          });
      } catch (err) {
          console.error("Failed to fetch profile:", err);
      } finally {
          setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!userData?._id) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      // Update local storage too
      const updatedUser = { ...userData, ...formData };
      localStorage.setItem('user', JSON.stringify({
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role
      }));

      toast.success('Profile updated successfully in MongoDB Atlas');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-zinc-500 font-medium animate-pulse">Syncing user profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-500/10">
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight">Your Profile</h1>
            <p className="text-zinc-400 mt-2 font-medium">Manage your personal information and platform configuration.</p>
          </div>
          <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-600/20 relative z-10 border border-white/10 uppercase">
            {formData.fullName.charAt(0) || 'U'}
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-20 translate-x-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> Information Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fname" className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest ml-1">Full Identity Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      id="fname" 
                      value={formData.fullName} 
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="rounded-2xl h-12 pl-12 bg-zinc-50/50 border-zinc-100 focus:ring-blue-600/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest ml-1">Registered Email (Static)</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 opacity-40" />
                    <Input 
                      id="email" 
                      value={userData?.email || ''} 
                      disabled 
                      className="rounded-2xl h-12 pl-12 bg-zinc-100/50 border-zinc-100 text-zinc-400 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest ml-1">Contact Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 00000 00000"
                      className="rounded-2xl h-12 pl-12 bg-zinc-50/50 border-zinc-100 focus:ring-blue-600/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roll" className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest ml-1">Assigned Identifier</Label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      id="roll" 
                      value={formData.rollNumber} 
                      onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                      placeholder="EVAL-2024-001"
                      className="rounded-2xl h-12 pl-12 bg-zinc-50/50 border-zinc-100 focus:ring-blue-600/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-14 px-10 shadow-lg shadow-zinc-950/10 font-bold flex items-center gap-3 transition-all active:scale-95"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Synchronize Profile
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-950 mb-6">Account Status</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-xs font-bold uppercase tracking-widest">Active System</span>
                      </div>
                      <Shield className="w-4 h-4" />
                   </div>
                   
                   <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Role Assignment</p>
                      <p className="text-sm font-bold text-zinc-950 capitalize">{userData?.role}</p>
                   </div>

                   {(userData?.role === 'instructor' || userData?.role === 'admin') && (
                     <>
                       <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Assigned Exams</p>
                          <p className="text-xl font-black text-blue-600">{userData?.assignedExams || 0}</p>
                       </div>
                       <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100">
                          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">AI Evaluations</p>
                          <p className="text-xl font-black text-purple-600">{userData?.totalEvaluations || 0}</p>
                       </div>
                     </>
                   )}

                   <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Member Since</p>
                      <p className="text-sm font-bold text-zinc-950">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Active Session'}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

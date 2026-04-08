import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Edit, Trash2, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt?: string;
}

export default function AdminManageUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        const data = await response.json();
        setUsers(data);
    } catch (err) {
        toast.error("Failed to load users");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: string) => {
    setUpdatingRole(uid);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${uid}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update role');
      
      toast.success(`User role updated to ${newRole}`);
      fetchUsers(); // Refresh
    } catch (err) {
      toast.error('Failed to update user role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">User Management</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Control platform access and assign administrative roles.</p>
          </div>
          <Button disabled className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-12 px-6 shadow-lg shadow-zinc-950/10 opacity-50">
            <UserPlus className="mr-2 h-4.5 w-4.5" /> Invite New User
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-12 bg-white border-border rounded-2xl h-12 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-12 bg-white rounded-2xl">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="instructor">Instructors</SelectItem>
              <SelectItem value="student">Students</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-zinc-500">User Identity</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Access Level</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Registered On</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                    <tr>
                        <td colSpan={4} className="p-20 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                            <p className="text-zinc-500 font-medium">Syncing User Directory...</p>
                        </td>
                    </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user._id} className="group hover:bg-zinc-50/80 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-950">{user.fullName}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                        'bg-zinc-100 text-zinc-700'
                      }`}>
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-zinc-500 font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" disabled={updatingRole === user._id}>
                            {updatingRole === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4 text-zinc-400" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl mt-2">
                          <p className="px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assign Role</p>
                          <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'admin')} className="font-medium">Administrator</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'instructor')} className="font-medium">Instructor</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'student')} className="font-medium">Student</DropdownMenuItem>
                          <div className="h-px bg-zinc-100 my-1" />
                          <DropdownMenuItem className="text-destructive font-medium">Deactivate Account</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LayoutDashboard, Upload, FileCheck, BarChart3, Users, BookOpen, FileText, ClipboardList, GraduationCap, User, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/manage-users', icon: Users, label: 'Manage Users' },
  { to: '/instructor-students', icon: GraduationCap, label: 'Students List' },
  { to: '/manage-exams', icon: FileText, label: 'Manage Exams' },
  { to: '/manage-subjects', icon: BookOpen, label: 'Manage Subjects' },
  { to: '/model-answers', icon: ClipboardList, label: 'Model Answers' },
  { to: '/upload', icon: Upload, label: 'Upload Papers' },
  { to: '/all-evaluations', icon: ClipboardList, label: 'All Evaluations' },
  { to: '/profile', icon: User, label: 'Profile Settings' },
];

const instructorLinks = [
  { to: '/instructor-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/instructor-students', icon: GraduationCap, label: 'Students List' },
  { to: '/manage-exams', icon: FileText, label: 'Manage Exams' },
  { to: '/manage-subjects', icon: BookOpen, label: 'Manage Subjects' },
  { to: '/model-answers', icon: ClipboardList, label: 'Model Answers' },
  { to: '/upload', icon: Upload, label: 'Upload Papers' },
  { to: '/profile', icon: User, label: 'Profile Settings' },
];

const studentLinks = [
  { to: '/student-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-results', icon: BarChart3, label: 'My Results' },
  { to: '/student-profile', icon: User, label: 'My Profile' },
];

interface LocalUser {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [role, setRole] = useState<string>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!storedUser || !token) {
        setLoading(false);
        navigate('/signin');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        // Fetch latest user data from backend to "analyse account type" in real-time
        const response = await fetch(`${API_BASE_URL}/api/users/${parsedUser.id || parsedUser._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const latestUser = await response.json();
          setUser(latestUser);
          const currentRole = latestUser.role || 'student';
          setRole(currentRole);
          
          // Redirect to correct dashboard if on the wrong one
          const path = location.pathname;
          if (currentRole === 'admin' && (path === '/student-dashboard' || path === '/instructor-dashboard')) {
            navigate('/dashboard');
          } else if (currentRole === 'instructor' && (path === '/dashboard' || path === '/student-dashboard')) {
            navigate('/instructor-dashboard');
          } else if (currentRole === 'student' && (path === '/dashboard' || path === '/instructor-dashboard')) {
            navigate('/student-dashboard');
          }

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(latestUser));
        } else {
          setUser(parsedUser);
          setRole(parsedUser.role || 'student');
        }
      } catch (err) {
        console.error("Error syncing user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, location.pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast.success('Signed out successfully');
  };

  const currentLinks = role === 'admin' ? adminLinks : role === 'instructor' ? instructorLinks : studentLinks;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-950 text-white fixed h-full z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5 shadow-lg shadow-blue-600/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">EvalAI</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2 pb-6 custom-scrollbar">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 mt-4">Menu</p>
          {currentLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-900">
          <div className="bg-zinc-900/50 rounded-2xl p-4">
             <div className="flex items-center gap-3 text-sm mb-4">
               <div className="bg-blue-600/20 w-8 h-8 rounded-full flex items-center justify-center border border-blue-500/20">
                 <User className="w-4 h-4 text-blue-500" />
               </div>
               <div className="truncate">
                 <p className="font-semibold text-zinc-100">{user?.fullName || 'Guest'}</p>
                 <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{role}</p>
               </div>
             </div>
             <button 
               onClick={handleSignOut}
               className="flex items-center gap-2 w-full p-2.5 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors text-xs font-semibold"
             >
               <LogOut className="h-4 w-4" /> Sign Out
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64 flex flex-col min-h-screen relative">
        {/* Top Header - Mobile & Action Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="lg:hidden flex items-center gap-3">
               <Link to="/" className="flex items-center gap-2">
                 <Brain className="h-6 w-6 text-blue-600" />
                 <span className="font-bold text-lg">EvalAI</span>
               </Link>
            </div>
            
            <div className="flex-1 hidden lg:block">
               <h2 className="text-sm font-medium text-zinc-400">
                 {location.pathname === '/dashboard' ? 'Overview Dashboard' : 
                  location.pathname === '/upload' ? 'Upload Assessment Papers' :
                  location.pathname.replace('/', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
               </h2>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1.5 rounded-full hover:bg-zinc-100 transition-all outline-none">
                    <div className="w-8 h-8 bg-zinc-950 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-zinc-100 shadow-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden sm:block text-left pr-2">
                       <p className="text-xs font-bold text-zinc-950 capitalize leading-none">{user?.fullName || 'User'}</p>
                       <p className="text-[9px] text-zinc-400 uppercase font-heavy tracking-widest mt-1">{role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-400 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>Your Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 lg:p-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

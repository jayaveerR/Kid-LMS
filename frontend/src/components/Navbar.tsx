import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('student');
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // Check localStorage for the user (Node.js Auth)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setRole(parsedUser.role || 'student');
    } else {
      setUser(null);
    }
  }, [location.pathname]); // Update when route changes

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload(); // Force refresh to clear states
  };

  const dashboardPath = role === 'student' 
    ? '/student-dashboard' 
    : role === 'instructor' 
      ? '/instructor-dashboard' 
      : '/dashboard';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/20">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">EvalAI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>Home</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">About</Link>
          <Link to="/features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Features</Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary/10 border border-primary/10">
                  <User className="h-4.5 w-4.5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/signin">
                <Button variant="ghost" className="font-medium">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="font-medium bg-zinc-950 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-950/20">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden border-t border-border bg-background"
        >
          <div className="container mx-auto flex flex-col gap-4 p-4 py-6">
            <Link to="/" onClick={() => setOpen(false)} className="text-lg font-medium">Home</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="text-lg font-medium">About</Link>
            <Link to="/features" onClick={() => setOpen(false)} className="text-lg font-medium">Features</Link>
            <div className="h-px bg-border my-2" />
            
            {user ? (
              <>
                <Link to={dashboardPath} onClick={() => setOpen(false)} className="text-lg font-medium text-primary">Dashboard</Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-lg font-medium">Profile</Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-left text-lg font-medium text-destructive mt-2"
                >
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/signin" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-zinc-950 text-white">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

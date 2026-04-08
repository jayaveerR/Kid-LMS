import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor' | 'admin'>('student');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      setSuccess(true);
      toast.success('Successfully registered! Please sign in.');
      
      setTimeout(() => {
        navigate('/signin');
      }, 2000);

    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-zinc-950">Success!</h2>
            <p className="text-zinc-500">Your account has been created. Redirecting to sign in...</p>
          </div>
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mt-4" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-zinc-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#3b82f620,transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#000,#111)]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <div className="bg-blue-600/20 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 mx-auto border border-blue-500/20">
            <Brain className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Join EvalAI Today</h1>
          <p className="text-zinc-400 text-lg max-w-md">
            The next generation of educational assessment and automated grading.
          </p>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-zinc-50">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950">Create Account</h2>
            <p className="text-zinc-500">Join our educational assessment platform</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-700">Full Name</Label>
              <Input 
                id="fullName"
                type="text" 
                placeholder="John Doe" 
                className="bg-white border-zinc-200 focus:ring-blue-500 text-zinc-900"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700">Email Address</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="name@example.com" 
                className="bg-white border-zinc-200 focus:ring-blue-500 text-zinc-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700">Password</Label>
              <Input 
                id="password"
                type="password" 
                className="bg-white border-zinc-200 focus:ring-blue-500 text-zinc-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-zinc-700">Account Type</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger id="role" className="bg-white border-zinc-200 text-zinc-900">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit"
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white h-11 transition-all mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

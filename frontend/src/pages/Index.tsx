import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import {
  ScanText, Brain, Users, BarChart3, Clock, Award, Shield, Upload,
  ArrowRight, Check
} from 'lucide-react';

const features = [
  { icon: ScanText, title: 'OCR Scanning', desc: 'Extract handwritten & printed answers automatically' },
  { icon: Brain, title: 'AI Evaluation', desc: 'Intelligent grading with contextual understanding' },
  { icon: Users, title: 'Role Management', desc: 'Admin, instructor, and student access controls' },
  { icon: BarChart3, title: 'Analytics', desc: 'Detailed performance insights and reports' },
  { icon: Clock, title: 'Time Saving', desc: 'Evaluate hundreds of papers in minutes' },
  { icon: Award, title: 'Accurate Scoring', desc: 'Consistent, unbiased evaluation results' },
  { icon: Shield, title: 'Secure', desc: 'End-to-end encryption for all exam data' },
  { icon: Upload, title: 'Bulk Upload', desc: 'Upload multiple papers at once with drag & drop' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Index() {
  const navigate = useNavigate();
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for authentication (Node.js Auth)
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const user = JSON.parse(storedUser);
      const role = user.role || 'student';

      if (role === 'student') navigate('/student-dashboard');
      else if (role === 'instructor') navigate('/instructor-dashboard');
      else if (role === 'admin') navigate('/dashboard');
      else navigate('/student-dashboard');
    } else {
      setSessionLoading(false);
    }
  }, [navigate]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Brain className="h-10 w-10 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          {/* Background pattern */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/5 to-transparent" />
          
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                Next Generation Assessment Platform
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl"
              >
                Automate Your Evaluation with <span className="text-primary italic">AI Precision</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              >
                EvalAI scans, understands, and grades handwritten answer sheets using state-of-the-art AI. Experience 95% faster evaluation with absolute consistency.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col gap-4 sm:flex-row sm:gap-6"
              >
                <Link to="/register">
                  <Button size="lg" className="h-14 bg-zinc-950 text-white rounded-2xl px-10 text-lg font-bold shadow-xl shadow-zinc-950/20 hover:scale-105 transition-all">Get Started Free</Button>
                </Link>
                <Link to="/signin">
                  <Button size="lg" variant="outline" className="h-14 rounded-2xl px-10 text-lg font-bold hover:bg-zinc-100 transition-all">Sign In</Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-20 w-full max-w-6xl rounded-[2.5rem] bg-zinc-950 p-6 shadow-2xl shadow-blue-500/10 border border-white/5 relative"
              >
                 <div className="aspect-video bg-zinc-900 rounded-[2rem] overflow-hidden flex items-center justify-center p-12 border border-white/5">
                    <img src="https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Dashboard Illustration" className="w-full h-full object-cover rounded-xl opacity-80" />
                 </div>
                 {/* Floating Badges */}
                 <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-border hidden md:block">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                          <Check className="w-6 h-6" />
                       </div>
                       <div className="text-left">
                          <p className="text-xs font-bold text-zinc-400">SUCCESS RATE</p>
                          <p className="text-xl font-black text-zinc-950">99.8% Accuracy</p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-zinc-950 py-32 text-white">
          <div className="container mx-auto px-4">
            <div className="mb-20 text-center">
              <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">Engineered for Accuracy</h2>
              <p className="mx-auto max-w-2xl text-lg text-zinc-400">Everything you need to modernize your educational institution's assessment cycle.</p>
            </div>
            
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  variants={item}
                  className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:shadow-2xl hover:shadow-white/5"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EvalAI</span>
          </div>
          <p className="text-muted-foreground">&copy; 2024 EvalAI LMS Migration Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

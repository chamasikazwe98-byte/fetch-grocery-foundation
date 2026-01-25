import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Splash = () => {
  const navigate = useNavigate();
  const { user, roles, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          // Role-based redirect
          if (roles.includes('driver')) {
            navigate('/driver', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, user, roles, isLoading]);

  return (
    <div className="min-h-screen gradient-splash flex flex-col items-center justify-center">
      <div className="animate-scale-in flex flex-col items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm shadow-elevated">
          <ShoppingBag className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Fetch</h1>
        <p className="text-white/80 text-lg">Groceries delivered fast</p>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="h-2 w-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Splash;

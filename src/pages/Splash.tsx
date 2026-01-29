import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import fetchLogo from '@/assets/fetch-logo.png';

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
      <div className="animate-scale-in flex flex-col items-center gap-6">
        <img 
          src={fetchLogo} 
          alt="Fetch!" 
          className="h-24 w-auto object-contain drop-shadow-2xl"
        />
        <p className="text-white/90 text-lg font-medium">Groceries delivered fast</p>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Splash;

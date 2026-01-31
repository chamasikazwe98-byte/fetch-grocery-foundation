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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="animate-scale-in flex flex-col items-center gap-8">
        <img 
          src={fetchLogo} 
          alt="Fetch!" 
          className="h-40 w-auto object-contain drop-shadow-xl"
        />
        <p className="text-foreground/70 text-xl font-medium">Groceries delivered fast</p>
      </div>
      
      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Splash;

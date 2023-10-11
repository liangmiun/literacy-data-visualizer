import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await logout();
      navigate('/login'); // navigate to login page after logout
    })();
  }, [logout, navigate]);

  return null; // render nothing
};

export default Logout;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Logout = ({setIsLogin}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await logout();
      setIsLogin(false);
      navigate('/login'); // navigate to login page after logout
    })();
  }, [logout, navigate, setIsLogin]);

  return null; // render nothing or (<div/>)
};

export default Logout;

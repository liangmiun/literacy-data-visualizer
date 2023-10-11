import App from './App';
import { AuthProvider } from './authentications/AuthContext';

const AppWrapper = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWrapper;
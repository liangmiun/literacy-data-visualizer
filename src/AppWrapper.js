import App from './App';
import { AuthProvider } from './authentications/AuthContext';

const AppWrapper = () => {
  return (
    // Wrap the App component with the AuthProvider
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWrapper;
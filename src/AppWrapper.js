import App from "./App";

const AppWrapper = () => {
  return (
    // If login/auchentication needed, wrap the App component with the AuthProvider from the AuthContext.js file
    <App />
  );
};

export default AppWrapper;

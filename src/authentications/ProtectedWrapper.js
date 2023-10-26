import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedWrapper = ( {element}) => {
  const { currentUser } = useAuth();
  //const currentUser = true;

  //console.log('ProtectedWrapper: currentUser:', currentUser);
  return (
    currentUser 
      ? element
      : <Navigate to="/login" replace />
  );
};

export default ProtectedWrapper;

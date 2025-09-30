import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { checkAuthStatus, setFirstTime } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error, isFirstTime } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if this is the first time opening the app
        const hasOpenedBefore = await AsyncStorage.getItem('hasOpenedBefore');
        if (!hasOpenedBefore) {
          dispatch(setFirstTime(true));
          await AsyncStorage.setItem('hasOpenedBefore', 'true');
          return;
        }

        // Check if user is already authenticated
        dispatch(checkAuthStatus());
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initializeAuth();
  }, [dispatch]);

  const isAuthenticated = !!user && !!token;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isFirstTime,
  };
};


"use client";

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useProductStore } from '../app/_zustand/store';

// This component manages the cart state based on the user's session.
const CartManager = () => {
  const { data: session, status } = useSession();
  const setUser = useProductStore((state) => state.setUser);
  const syncCartOnLogin = useProductStore((state) => state.syncCartOnLogin);
  const isLoggedIn = useProductStore((state) => state.isLoggedIn);

  // Use a ref to track if the initial sync has been performed
  const initialSyncDone = useRef(false);

  useEffect(() => {
    const handleAuthChange = async () => {
      const userId = (session?.user as any)?.id || null;

      if (status === 'authenticated' && userId && !isLoggedIn) {
        // User has just logged in
        console.log('User authenticated, syncing cart...');
        await syncCartOnLogin(userId);
        initialSyncDone.current = true;
      } else if (status === 'unauthenticated' && isLoggedIn) {
        // User has just logged out
        console.log('User logged out, clearing user-specific cart data...');
        await setUser(null);
        initialSyncDone.current = false;
      } else if (status === 'authenticated' && userId && !initialSyncDone.current) {
        // Session was already active on page load
        console.log('Session active on load, setting user and loading cart...');
        await setUser(userId);
        initialSyncDone.current = true;
      }
    };

    handleAuthChange();

  }, [status, session, isLoggedIn, setUser, syncCartOnLogin]);

  return null; // This is a logic-only component, it doesn't render anything
};

export default CartManager;


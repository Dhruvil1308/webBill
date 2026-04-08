'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';

// For production, these should be verified environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Enterprise Real-time Kitchen logic
 */
export const useKitchenOrders = (hotelId: string) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?hotelId=${hotelId}`);
      if (!res.ok) throw new Error('Failed to fetch initial orders');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchOrders();

    if (!supabase) {
        console.warn('Real-time sync unavailable: Missing credentials. Falling back to polling mode.');
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }

    const channel = supabase
      .channel(`hotel-orders-${hotelId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to All changes (Insert/Update/Delete) for 10/10 reactivity
          schema: 'public',
          table: 'Order',
          filter: `hotelId=eq.${hotelId}`,
        },
        async (payload) => {
          // Robust reactivity: full data refresh or targeted update
          if (payload.eventType === 'INSERT') {
            setOrders((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((current) => current.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
          } else {
            fetchOrders(); // Complex changes trigger full refresh for consistency
          }
          
          if (payload.eventType === 'INSERT' && typeof Notification !== 'undefined') {
            new Notification('New KOT Order!', { body: `Table #${payload.new.tableId}` });
          }
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hotelId, fetchOrders]);

  return { orders, error, isLive, refetch: fetchOrders };
};

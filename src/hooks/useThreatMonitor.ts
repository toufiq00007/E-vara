/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'evara-local-findings';

export const useThreatMonitor = () => {
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const loadLocalFallback = useCallback(() => {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        setFindings(JSON.parse(localData));
      } catch (e) {
        console.error('Failed to parse local findings:', e);
      }
    } else {
      // Premium Mock Data for first-time demo users
      setFindings([
        {
          id: '1',
          severity: 'high',
          title: 'Identity Compromised: LinkedIn 2021',
          source: 'Dark Web Leak',
          description: 'User email and password hash found in a verified dataset. Recommended action: Rotate credentials.',
          found_at: new Date().toISOString()
        },
        {
          id: '2',
          severity: 'medium',
          title: 'Partial Identity Match: GitHub Metadata',
          source: 'Public OSINT',
          description: 'Reused handle detected across 3 social platforms with linked profile markers.',
          found_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    }
    setIsOffline(true);
  }, []);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('threat_findings')
          .select('*')
          .order('found_at', { ascending: false });
        
        if (error) throw error;
        
        const results = data || [];
        setFindings(results);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
        setIsOffline(false);
      } catch (err: any) {
        // If Supabase fails (e.g. ERR_NAME_NOT_RESOLVED), fallback to local
        console.warn('Supabase unreachable, using local intelligence cache:', err.message);
        loadLocalFallback();
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();

    // Real-time subscription - only if not offline
    let channel: any;
    try {
      channel = supabase
        .channel('threat-updates')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'threat_findings' }, 
          (payload) => {
            setFindings(prev => {
              const updated = [payload.new, ...prev];
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              return updated;
            });
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Real-time subscription failed. Live updates disabled.');
          }
        });
    } catch (e) {
      console.warn('Real-time initialization failed.');
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [loadLocalFallback]);

  return { findings, loading, isOffline };
};

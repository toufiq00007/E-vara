import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface IdentityInfo {
  fullName: string;
  username: string;
  socialLink: string;
  keywords: string;
  faceImage: string | null;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // 1. Unified Session Query
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user ?? null;
    },
    staleTime: Infinity, // Keep session until manually invalidated
  });

  // 2. Optimized Sign In
  const loginMutation = useMutation({
    mutationFn: async ({ email, pass }: any) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      return data.user;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(["auth-user"], newUser);
      toast.success("Login Successful", { description: "Session established." });
    },
    onError: (err: any) => {
      toast.error("Auth Error", { description: err.message });
    }
  });

  // 3. Register Mutation
  const registerMutation = useMutation({
    mutationFn: async ({ email, pass }: any) => {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Designation Created", { description: "Verification email sent." });
    },
    onError: (err: any) => {
      toast.error("Registration Error", { description: err.message });
    }
  });

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.setQueryData(["auth-user"], null);
    localStorage.removeItem("evara-identity");
    toast.success("Session Terminated");
  }, [queryClient]);

  const getIdentity = useCallback((): IdentityInfo | null => {
    const data = localStorage.getItem("evara-identity");
    return data ? JSON.parse(data) : null;
  }, []);

  const saveIdentity = useCallback((info: IdentityInfo) => {
    localStorage.setItem("evara-identity", JSON.stringify(info));
  }, []);

  return { 
    user, 
    loading, 
    login: (e: string, p: string) => loginMutation.mutateAsync({ email: e, pass: p }),
    register: (e: string, p: string) => registerMutation.mutateAsync({ email: e, pass: p }),
    logout, 
    getIdentity, 
    saveIdentity 
  };
}

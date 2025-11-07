"use server";

import { supabase } from "@/lib/supabase";
import { appUrl } from "@/utils/config";

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error("Error Supabase sign-up with email", error);
    throw new Error(error.message);
  }
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Error Supabase log-in with email", error);
    throw new Error(error.message);
  }
  return data.user;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${appUrl}/dashboard` },
  });
  if (error) {
    console.error("Error Supabase sign-in with google", error);
    throw new Error(error.message);
  }
  return data.url;
}

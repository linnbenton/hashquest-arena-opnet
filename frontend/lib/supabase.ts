import { createClient } from "@supabase/supabase-js";

// =========================
// 🔐 ENV VALIDATION (ANTI CRASH)
// =========================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Supabase ENV not configured");
}

// =========================
// 🚀 CLIENT
// =========================
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // 🔥 penting buat backend
  }
});
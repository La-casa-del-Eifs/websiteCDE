import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type { TeamMember } from "@/types/database";

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    return (data as TeamMember[]) ?? [];
  } catch {
    return [];
  }
}

export async function getTeamMembersAll(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true });
    return (data as TeamMember[]) ?? [];
  } catch {
    return [];
  }
}

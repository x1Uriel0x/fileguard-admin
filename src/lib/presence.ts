import { supabase } from "./supabase";

export const presenceChannel = supabase.channel("online-users", {
  config: {
    presence: { key: "user_id" },
  },
});

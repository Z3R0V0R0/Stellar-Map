import { supabase } from "../lib/supabase";

export const saveMap = async (mapData, mapName) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não logado");

  const { count } = await supabase
    .from("maps")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count >= 5) throw new Error("MAP_LIMIT_REACHED");

  const { error } = await supabase
    .from("maps")
    .insert([{ user_id: user.id, name: mapName, data: mapData }]);

  if (error) throw error;
};

export const loadMaps = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("maps")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;

  return data;
};
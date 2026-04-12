import { supabase } from "../lib/supabase";

export const saveMap = async (mapData, mapName) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não logado");

  const { error } = await supabase
    .from("maps")
    .insert([
      {
        user_id: user.id,
        name: mapName,
        data: mapData,
      },
    ]);

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
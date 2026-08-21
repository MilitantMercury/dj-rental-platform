"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { preparationItemStatus } from "@/lib/preparation-checklist";

function readQuantity(data: FormData, name: string) {
  const value = Number(data.get(name));
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export async function updatePreparationItem(data: FormData) {
  const requestId = String(data.get("requestId") ?? "");
  const itemId = String(data.get("itemId") ?? "");
  const expectedQuantity = readQuantity(data, "expectedQuantity");
  const preparedQuantity = readQuantity(data, "preparedQuantity");
  const deliveredQuantity = readQuantity(data, "deliveredQuantity");
  const returnedQuantity = readQuantity(data, "returnedQuantity");
  const notes = String(data.get("notes") ?? "").trim();
  const invalid = !requestId || !itemId || expectedQuantity === null || preparedQuantity === null || deliveredQuantity === null || returnedQuantity === null || preparedQuantity > expectedQuantity || deliveredQuantity > expectedQuantity || returnedQuantity > expectedQuantity || notes.length > 2000;
  if (invalid) redirect(`/area-riservata/pratiche/${requestId}/operativita?message=quantita-non-valida`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data: staff } = await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (!staff) redirect("/area-riservata");
  const status = preparationItemStatus({ expectedQuantity, preparedQuantity, deliveredQuantity, returnedQuantity });
  const { error } = await supabase.from("preparation_items").update({ prepared_quantity: preparedQuantity, delivered_quantity: deliveredQuantity, returned_quantity: returnedQuantity, status, notes, updated_by: user.id }).eq("id", itemId);
  revalidatePath(`/area-riservata/pratiche/${requestId}/operativita`);
  redirect(`/area-riservata/pratiche/${requestId}/operativita?message=${error ? "aggiornamento-non-riuscito" : "checklist-aggiornata"}`);
}

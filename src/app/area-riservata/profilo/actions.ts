"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasValidCustomerDetails } from "@/lib/domain/customer-registration";
import { createClient } from "@/lib/supabase/server";

const read = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const finish = (message: string): never =>
  redirect(`/area-riservata/profilo?message=${encodeURIComponent(message)}`);

export async function updateCustomerProfile(data: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/accesso");

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (staff) finish("Il profilo fiscale è disponibile soltanto per gli account cliente.");

  const values = {
    customerType: read(data, "customerType"),
    firstName: read(data, "firstName"),
    lastName: read(data, "lastName"),
    phone: read(data, "phone"),
    address: read(data, "address"),
    companyName: read(data, "companyName"),
    taxCode: read(data, "taxCode"),
    vatNumber: read(data, "vatNumber"),
    pec: read(data, "pec"),
    recipientCode: read(data, "recipientCode").toUpperCase(),
  };

  if (!hasValidCustomerDetails(values)) {
    finish("Controlla i dati obbligatori prima di salvare.");
  }

  const isBusiness = values.customerType === "business";
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: isBusiness ? "" : values.firstName,
      last_name: isBusiness ? "" : values.lastName,
      phone: values.phone,
    })
    .eq("user_id", user.id);

  const { error: customerError } = await supabase
    .from("customer_profiles")
    .update({
      customer_type: values.customerType,
      address: values.address,
      company_name: isBusiness ? values.companyName : null,
      tax_code: isBusiness ? null : values.taxCode,
      vat_number: isBusiness ? values.vatNumber : null,
      pec: isBusiness ? values.pec || null : null,
      recipient_code: isBusiness ? values.recipientCode || null : null,
    })
    .eq("user_id", user.id);

  if (profileError || customerError) {
    finish("Non è stato possibile aggiornare il profilo.");
  }

  await supabase.auth.updateUser({
    data: {
      first_name: isBusiness ? "" : values.firstName,
      last_name: isBusiness ? "" : values.lastName,
      customer_type: values.customerType,
      company_name: isBusiness ? values.companyName : "",
      phone: values.phone,
      address: values.address,
      tax_code: isBusiness ? "" : values.taxCode,
      vat_number: isBusiness ? values.vatNumber : "",
      pec: isBusiness ? values.pec : "",
      recipient_code: isBusiness ? values.recipientCode : "",
    },
  });

  revalidatePath("/", "layout");
  finish("Profilo aggiornato correttamente.");
}

export async function updateStaffProfile(data: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/accesso");

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const staffRole = staff?.role;
  if (!staffRole) finish("Profilo staff non disponibile.");

  const phone = read(data, "phone");
  const displayName = read(data, "displayName");
  if ((phone && phone.length < 6) || !displayName) {
    finish("Controlla i dati inseriti prima di salvare.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ phone: phone || null })
    .eq("user_id", user.id);

  const staffError = staffRole === "owner"
    ? (await supabase
        .from("staff_profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id)).error
    : null;

  if (profileError || staffError) {
    finish("Non è stato possibile aggiornare il profilo.");
  }

  revalidatePath("/", "layout");
  finish("Profilo aggiornato correttamente.");
}

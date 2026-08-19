import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomerProfileForm, StaffProfileForm } from "./profile-form";
import { BackLink } from "@/components/back-link";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/accesso");

  const [profileResult, customerResult, staffResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name,last_name,email,phone")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("customer_profiles")
      .select("customer_type,company_name,tax_code,vat_number,address,address_street,address_number,address_postal_code,address_city,address_province,address_country,pec,recipient_code")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("staff_profiles")
      .select("role,display_name")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const customer = customerResult.data;
  const staff = staffResult.data;

  return (
    <main className="dashboard shell profile-page">
      <BackLink href="/area-riservata">Area riservata</BackLink>
      <div className="profile-page-heading">
        <div>
          <p className="eyebrow dark">Account</p>
          <h1>Il mio profilo.</h1>
          <p>Controlla e completa i dati associati al tuo account.</p>
        </div>
        <span>{staff ? (staff.role === "owner" ? "Owner" : "Collaboratore") : "Cliente"}</span>
      </div>

      {message && <div className="profile-message" role="status">{message}</div>}

      {staff ? (
        <StaffProfileForm
          initial={{
            displayName: staff.display_name,
            email: user.email || profile?.email || "",
            phone: profile?.phone || "",
            canEditDisplayName: staff.role === "owner",
          }}
        />
      ) : (
        <CustomerProfileForm
          initial={{
            customerType: customer?.customer_type === "business" ? "business" : "private",
            firstName: profile?.first_name || "",
            lastName: profile?.last_name || "",
            email: user.email || profile?.email || "",
            phone: profile?.phone || "",
            addressLegacy: customer?.address || "",
            addressStreet: customer?.address_street || "",
            addressNumber: customer?.address_number || "",
            addressPostalCode: customer?.address_postal_code || "",
            addressCity: customer?.address_city || "",
            addressProvince: customer?.address_province || "",
            addressCountry: customer?.address_country || "Italia",
            companyName: customer?.company_name || "",
            taxCode: customer?.tax_code || "",
            vatNumber: customer?.vat_number || "",
            pec: customer?.pec || "",
            recipientCode: customer?.recipient_code || "",
          }}
        />
      )}
    </main>
  );
}

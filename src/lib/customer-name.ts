export function customerDisplayName(
  profile: { first_name: string; last_name: string } | null | undefined,
  customerProfile: {
    customer_type: string;
    company_name: string | null;
  } | null | undefined,
  fallback: string,
) {
  if (customerProfile?.customer_type === "business") {
    return customerProfile.company_name?.trim() || fallback;
  }

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "";
  return fullName || fallback;
}

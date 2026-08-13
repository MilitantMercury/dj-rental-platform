export const APP_TIME_ZONE = "Europe/Rome" as const;
export const APP_CURRENCY = "EUR" as const;
export const APP_LOCALE = "it-IT" as const;

export const USER_ROLES = ["customer", "collaborator", "owner"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  customer: "Cliente",
  collaborator: "Collaboratore",
  owner: "Owner",
};

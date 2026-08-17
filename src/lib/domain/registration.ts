export function isDuplicateRegistration(response: {
  errorCode?: string;
  errorMessage?: string;
  identities?: unknown[];
}) {
  return (
    response.errorCode === "user_already_exists" ||
    response.errorMessage === "User already registered" ||
    response.identities?.length === 0
  );
}

const OWNER_STATUS_TRANSITIONS = {
  received: ["in_review", "rejected", "cancelled"],
  in_review: ["received", "rejected", "cancelled"],
} as const;

export function ownerStatusTransitions(currentStatus: string): readonly string[] {
  return OWNER_STATUS_TRANSITIONS[currentStatus as keyof typeof OWNER_STATUS_TRANSITIONS] ?? [];
}

export function isAllowedOwnerStatusTransition(currentStatus: string, nextStatus: string) {
  return ownerStatusTransitions(currentStatus).includes(nextStatus);
}

export function defaultStatusTransitionNote() {
  return "Stato aggiornato dall’owner.";
}

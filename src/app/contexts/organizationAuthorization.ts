import type { ValidatedMembership } from '../security/types';

export function selectValidatedMembership(
  memberships: ValidatedMembership[],
  preferredOrganizationId: string | null,
): ValidatedMembership | null {
  return memberships.find((item) => item.organizationId === preferredOrganizationId)
    ?? memberships[0]
    ?? null;
}

export function selectOrganizationForSwitch(
  memberships: ValidatedMembership[],
  organizationId: string,
): ValidatedMembership | null {
  return memberships.find((item) => item.organizationId === organizationId) ?? null;
}

export function authorizationResponseIsCurrent(
  requestUserId: string,
  currentUserId: string | null,
): boolean {
  return requestUserId === currentUserId;
}

export function initialAuthorizationIsLoading(
  userId: string | null,
  validatedUserId: string | null,
  loading: boolean,
): boolean {
  return Boolean(userId) && (loading || validatedUserId !== userId);
}

/** Coalesces focus/visibility/interval signals while one backend validation is active. */
export function createRevalidationCoordinator(validate: () => Promise<void>) {
  let active: Promise<void> | null = null;
  return () => {
    if (active) return active;
    active = validate().finally(() => { active = null; });
    return active;
  };
}

export function createVisibleRevalidationHandler(
  revalidate: () => Promise<void>,
  visibility: () => DocumentVisibilityState,
) {
  return () => { if (visibility() === 'visible') void revalidate(); };
}

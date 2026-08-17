/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROLE STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Manages the active role state with localStorage persistence.
 */

import * as React from 'react';
import type { Role } from '../nav/navManifest';
import { getDefaultRouteForRole } from '../nav/getNavForRole';

// For backward compatibility, export RoleKey as alias for Role
export type RoleKey = Role;

const STORAGE_KEY = 'workos_role'; // Must match DevRoleSwitcher

// Global state
let activeRole: RoleKey = 'employee';
let listeners: Array<(role: RoleKey) => void> = [];

/**
 * Initialize role from localStorage or default to employee
 */
export function initializeRole(): RoleKey {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'employee' || stored === 'org_admin' || stored === 'platform_admin')) {
      activeRole = stored as RoleKey;
    } else {
      // Also check auth role
      const authRole = localStorage.getItem('workos_auth_role');
      if (authRole && (authRole === 'employee' || authRole === 'org_admin' || authRole === 'platform_admin')) {
        activeRole = authRole as RoleKey;
      } else {
        activeRole = 'employee';
      }
      localStorage.setItem(STORAGE_KEY, activeRole);
    }
  } catch (error) {
    console.warn('Failed to load role from localStorage:', error);
    activeRole = 'employee';
  }
  return activeRole;
}

/**
 * Get the current active role
 */
export function getActiveRole(): RoleKey {
  return activeRole;
}

/**
 * Set the active role and persist to localStorage
 */
export function setActiveRole(role: RoleKey): void {
  if (role === activeRole) return;
  
  activeRole = role;
  
  // Persist to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, role);
  } catch (error) {
    console.warn('Failed to save role to localStorage:', error);
  }
  
  // Notify listeners
  listeners.forEach(listener => listener(role));
}

/**
 * Subscribe to role changes
 */
export function subscribeToRoleChanges(listener: (role: RoleKey) => void): () => void {
  listeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

/**
 * Get the default route for current role
 */
export function getCurrentDefaultRoute(): string {
  return getDefaultRouteForRole(activeRole);
}

/**
 * Hook for React components to use role state
 */
export function useRoleState(): [RoleKey, (role: RoleKey) => void] {
  const [role, setRole] = React.useState<RoleKey>(getActiveRole);
  
  React.useEffect(() => {
    const unsubscribe = subscribeToRoleChanges(setRole);
    return unsubscribe;
  }, []);
  
  return [role, setActiveRole];
}
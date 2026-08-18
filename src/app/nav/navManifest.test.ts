import { describe, expect, it } from 'vitest';

import {
  findNavItemByPath,
  getAllPaths,
  getPathsForRole,
  type Role,
} from './navManifest';

const roles: Role[] = ['employee', 'org_admin', 'platform_admin'];

describe('navigation manifest invariants', () => {
  it('contains only absolute paths that resolve to manifest items', () => {
    const paths = getAllPaths();

    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path).toMatch(/^\//);
      expect(findNavItemByPath(path)).not.toBeNull();
    }
  });

  it.each(roles)('returns only paths assigned to %s', (role) => {
    for (const path of getPathsForRole(role)) {
      expect(findNavItemByPath(path, role)?.roles).toContain(role);
    }
  });
});

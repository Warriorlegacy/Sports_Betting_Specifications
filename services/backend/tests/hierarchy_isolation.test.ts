describe('5-Tier Hierarchy Subtree Isolation & Role Permission Tests', () => {
  const ROLE_HIERARCHY: Record<string, string> = {
    ADMIN: 'SUPER_MASTER',
    SUPER_MASTER: 'MASTER',
    MASTER: 'AGENT',
    AGENT: 'USER'
  };

  function isPermittedDownlineCreation(parentRole: string, targetRole: string): boolean {
    return ROLE_HIERARCHY[parentRole] === targetRole;
  }

  test('Global Admin can create Super Master but not direct Player', () => {
    expect(isPermittedDownlineCreation('ADMIN', 'SUPER_MASTER')).toBe(true);
    expect(isPermittedDownlineCreation('ADMIN', 'USER')).toBe(false);
  });

  test('Super Master can create Master but not Agent directly', () => {
    expect(isPermittedDownlineCreation('SUPER_MASTER', 'MASTER')).toBe(true);
    expect(isPermittedDownlineCreation('SUPER_MASTER', 'AGENT')).toBe(false);
  });

  test('Master can create Agent', () => {
    expect(isPermittedDownlineCreation('MASTER', 'AGENT')).toBe(true);
    expect(isPermittedDownlineCreation('MASTER', 'USER')).toBe(false);
  });

  test('Agent can create Player (User)', () => {
    expect(isPermittedDownlineCreation('AGENT', 'USER')).toBe(true);
    expect(isPermittedDownlineCreation('AGENT', 'MASTER')).toBe(false);
  });

  test('Player cannot create any downline account', () => {
    expect(isPermittedDownlineCreation('USER', 'USER')).toBe(false);
  });
});

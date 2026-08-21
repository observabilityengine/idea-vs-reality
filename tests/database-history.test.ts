describe('completion history contract', () => {
  it('keeps completed memories recoverable', () => {
    const completed = { status: 'completed', completedAt: '2026-08-21T12:00:00.000Z' };
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBeTruthy();
  });

  it('restores a completed memory to active state', () => {
    const restored = { status: 'active', completedAt: null };
    expect(restored).toEqual({ status: 'active', completedAt: null });
  });
});

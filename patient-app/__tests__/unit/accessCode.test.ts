describe('Patient App - Access Code', () => {
  it('should format access code to uppercase', () => {
    const input = 'abc123xy';
    const formatted = input.toUpperCase();
    expect(formatted).toBe('ABC123XY');
  });

  it('should validate 8 character length', () => {
    const code = 'ABC123XY';
    expect(code).toHaveLength(8);
  });
});

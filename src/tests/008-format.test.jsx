test('formats date-ish', () => {
  const d = new Date(Date.UTC(2024, 0, 1)); // 2024-01-01T00:00:00Z
  expect(d.getUTCFullYear()).toBe(2024);
});

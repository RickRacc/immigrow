test("object has key", () => {
  const x = { a: 1 };
  expect(Object.keys(x)).toContain("a");
});

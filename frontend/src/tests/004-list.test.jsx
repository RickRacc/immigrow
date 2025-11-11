import { render, screen } from "@testing-library/react";
function L(){ return <ul><li>A</li><li>B</li></ul>; }
test("renders list items", () => {
  render(<L />);
  expect(screen.getAllByRole("listitem").length).toBe(2);
});

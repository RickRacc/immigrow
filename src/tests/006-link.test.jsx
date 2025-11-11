import { render, screen } from "@testing-library/react";
function A(){ return <a href="/">Home</a>; }
test("link present", () => {
  render(<A />);
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
});

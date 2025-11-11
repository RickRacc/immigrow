import { render, screen } from "@testing-library/react";
function Btn(){ return <button>Go</button>; }
test("button visible", () => {
  render(<Btn />);
  expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
});

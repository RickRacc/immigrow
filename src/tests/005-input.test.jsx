import { render, screen } from "@testing-library/react";
function I(){ return <input placeholder="search" />; }
test("input present", () => {
  render(<I />);
  expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
});

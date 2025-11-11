import { render, screen } from "@testing-library/react";
function Card(){ return <article><h2>Title</h2><p>Body</p></article>; }
test("card title", () => {
  render(<Card />);
  expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
});

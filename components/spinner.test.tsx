// components/spinner.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./spinner";

// 'describe' is a way to group related tests together.
describe("Spinner Component", () => {
  // 'it' or 'test' defines an individual test case.
  it("should render the spinner SVG", () => {
    // 1. Arrange: Render the component into a virtual DOM.
    render(<Spinner />);

    // 2. Act: In this simple case, there's no user action to perform.
    // We just need to check the output.

    // 3. Assert: Find the rendered SVG and check if it's in the document.
    // `screen` is an object from React Testing Library that has queries to find elements.
    // We're looking for an element with the `animate-spin` class.
    const spinnerElement = screen.getByTestId("spinner"); // data-testid added

    // `expect` is from Jest. We use it with a "matcher" (`.toBeInTheDocument()`)
    // to check if our expectation is correct.
    expect(spinnerElement).toBeInTheDocument();

    // We can also check for specific attributes, like classes.
    expect(spinnerElement).toHaveClass("animate-spin");
  });
});

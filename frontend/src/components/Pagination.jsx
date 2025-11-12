// src/components/Pagination.jsx
import { Button, ButtonGroup } from "react-bootstrap";

// Display info component for top of page
export function PaginationInfo({ currentCount, itemType = "items" }) {
  return (
    <p className="text-muted mb-3">
      Displaying {currentCount} {itemType}
    </p>
  );
}

// Navigation controls component for bottom of page
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const handleFirst = () => onPageChange(1);
  const handlePrevious = () => onPageChange(currentPage - 1);
  const handleNext = () => onPageChange(currentPage + 1);
  const handleLast = () => onPageChange(totalPages);

  return (
    <div className="d-flex flex-column align-items-center gap-3 my-4">
      {/* Display current page and total pages */}
      <div className="text-center">
        <p className="mb-0 fw-bold">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Navigation buttons */}
      <ButtonGroup>
        <Button
          variant="outline-primary"
          onClick={handleFirst}
          disabled={currentPage === 1}
        >
          First
        </Button>
        <Button
          variant="outline-primary"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline-primary"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
        <Button
          variant="outline-primary"
          onClick={handleLast}
          disabled={currentPage === totalPages}
        >
          Last
        </Button>
      </ButtonGroup>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination__arrow"
        onClick={onPrevious}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      <span className="pagination__label">
        {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        className="pagination__arrow"
        onClick={onNext}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
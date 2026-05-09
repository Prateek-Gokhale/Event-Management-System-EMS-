function SkeletonGrid({ count = 6 }) {
  return (
    <div className="event-grid" aria-label="Loading content">
      {Array.from({ length: count }, (_, index) => (
        <article className="event-card skeleton-card" key={index}>
          <div className="skeleton skeleton-image" />
          <div className="event-content">
            <div className="skeleton skeleton-chip" />
            <div className="skeleton skeleton-line wide" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-actions" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default SkeletonGrid;

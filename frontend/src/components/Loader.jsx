function Loader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader-ring" aria-hidden="true" />
      <span>Loading events...</span>
    </div>
  );
}

export default Loader;

function Modal({ open, title, children, onClose, onConfirm, confirmText = "Confirm" }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{title}</h3>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;

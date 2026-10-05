const LABELS = {
  pending: "Pending",
  processing: "Processing",
  success: "Successful",
  failed: "Failed",
  abandoned: "Cancelled",
  refunded: "Refunded",
};

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status] || status}</span>;
}

export default StatusBadge;

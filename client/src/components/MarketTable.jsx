function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MarketTable({ records, onEdit, onDelete, showActions = true }) {
  if (!records || records.length === 0) {
    return (
      <div className="empty-state">
        <p>No market records found.</p>
        <p>Add your first market record to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="market-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Demand</th>
            <th>Location</th>
            <th>Date</th>
            {showActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record._id}>
              <td data-label="Product">{record.product}</td>
              <td data-label="Category">{record.category}</td>
              <td data-label="Price">₹{record.price}/{record.unit}</td>
              <td data-label="Quantity">
                {record.quantity} {record.unit}
              </td>
              <td data-label="Demand">
                {record.demand} {record.unit}
              </td>
              <td data-label="Location">{record.location}</td>
              <td data-label="Date">{formatDate(record.date)}</td>
              {showActions ? (
                <td data-label="Actions" className="actions-cell">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onEdit(record)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDelete(record)}
                  >
                    Delete
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MarketTable;

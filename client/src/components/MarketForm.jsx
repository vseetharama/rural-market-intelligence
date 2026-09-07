import { useEffect, useState } from 'react';

const emptyForm = {
  product: '',
  category: '',
  price: '',
  quantity: '',
  unit: 'kg',
  demand: '',
  location: '',
  date: new Date().toISOString().slice(0, 10),
};

function MarketForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setForm({
        product: initialValues.product || '',
        category: initialValues.category || '',
        price: initialValues.price ?? '',
        quantity: initialValues.quantity ?? '',
        unit: initialValues.unit || 'kg',
        demand: initialValues.demand ?? '',
        location: initialValues.location || '',
        date: initialValues.date
          ? new Date(initialValues.date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.product.trim()) nextErrors.product = 'Product is required';
    if (!form.category.trim()) nextErrors.category = 'Category is required';
    if (form.price === '' || Number(form.price) < 0) {
      nextErrors.price = 'Price must be 0 or greater';
    }
    if (form.quantity === '' || Number(form.quantity) < 0) {
      nextErrors.quantity = 'Quantity must be 0 or greater';
    }
    if (!form.unit.trim()) nextErrors.unit = 'Unit is required';
    if (form.demand === '' || Number(form.demand) < 0) {
      nextErrors.demand = 'Demand must be 0 or greater';
    }
    if (!form.location.trim()) nextErrors.location = 'Location is required';
    if (!form.date) nextErrors.date = 'Date is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        product: form.product.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        unit: form.unit.trim(),
        demand: Number(form.demand),
        location: form.location.trim(),
        date: form.date,
      });

      if (!initialValues) {
        setForm(emptyForm);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="market-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label>
          Product
          <input
            name="product"
            value={form.product}
            onChange={handleChange}
            placeholder="Tomato"
          />
          {errors.product ? <span className="field-error">{errors.product}</span> : null}
        </label>

        <label>
          Category
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Vegetable"
          />
          {errors.category ? <span className="field-error">{errors.category}</span> : null}
        </label>

        <label>
          Price per unit (₹)
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="30"
          />
          {errors.price ? <span className="field-error">{errors.price}</span> : null}
        </label>

        <label>
          Quantity
          <input
            name="quantity"
            type="number"
            min="0"
            step="0.01"
            value={form.quantity}
            onChange={handleChange}
            placeholder="50"
          />
          {errors.quantity ? <span className="field-error">{errors.quantity}</span> : null}
        </label>

        <label>
          Unit
          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder="kg"
          />
          {errors.unit ? <span className="field-error">{errors.unit}</span> : null}
        </label>

        <label>
          Demand quantity
          <input
            name="demand"
            type="number"
            min="0"
            step="0.01"
            value={form.demand}
            onChange={handleChange}
            placeholder="200"
          />
          {errors.demand ? <span className="field-error">{errors.demand}</span> : null}
        </label>

        <label>
          Location
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Udupi"
          />
          {errors.location ? <span className="field-error">{errors.location}</span> : null}
        </label>

        <label>
          Date
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
          {errors.date ? <span className="field-error">{errors.date}</span> : null}
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default MarketForm;

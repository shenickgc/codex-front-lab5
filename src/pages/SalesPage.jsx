import { useEffect, useState } from 'react';
import { getProductsRequest } from '../services/productService';
import {
  createQuoteRequest,
  deleteQuoteRequest,
  getQuotesRequest,
  updateQuoteRequest,
} from '../services/quoteService';
import { downloadQuotePdf } from '../utils/quotePdf';

const quoteStatuses = ['draft', 'sent', 'approved', 'rejected'];

const createEmptyItem = () => ({
  product: '',
  name: '',
  quantity: '1',
  unitPrice: '',
});

const createInitialForm = () => ({
  customerName: '',
  customerEmail: '',
  description: '',
  status: 'draft',
  notes: '',
  items: [createEmptyItem()],
});

function SalesPage() {
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(createInitialForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ quotes: quoteList }, { products: productList }] = await Promise.all([
          getQuotesRequest(),
          getProductsRequest(),
        ]);

        setQuotes(quoteList);
        setProducts(productList);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'No se pudieron cargar las cotizaciones o productos.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleQuoteFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const nextItems = [...prev.items];
      const nextItem = { ...nextItems[index], [field]: value };

      if (field === 'product') {
        const selectedProduct = products.find((product) => product._id === value);
        if (selectedProduct) {
          nextItem.name = selectedProduct.name;
          nextItem.unitPrice = String(selectedProduct.price);
        }
      }

      nextItems[index] = nextItem;
      return { ...prev, items: nextItems };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
  };

  const removeItem = (index) => {
    setForm((prev) => {
      if (prev.items.length === 1) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const resetForm = () => {
    setForm(createInitialForm());
    setEditingId(null);
  };

  const buildPayload = () => ({
    customerName: form.customerName.trim(),
    customerEmail: form.customerEmail.trim(),
    description: form.description.trim(),
    status: form.status,
    notes: form.notes.trim(),
    items: form.items.map((item) => ({
      product: item.product || undefined,
      name: item.name.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setFeedback('');

    try {
      const payload = buildPayload();

      if (editingId) {
        const { quote, message } = await updateQuoteRequest(editingId, payload);
        setQuotes((prev) => prev.map((item) => (item._id === editingId ? quote : item)));
        setFeedback(message);
      } else {
        const { quote, message } = await createQuoteRequest(payload);
        setQuotes((prev) => [quote, ...prev]);
        setFeedback(message);
      }

      resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo guardar la cotizacion.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (quote) => {
    setEditingId(quote._id);
    setForm({
      customerName: quote.customerName,
      customerEmail: quote.customerEmail || '',
      description: quote.description || '',
      status: quote.status,
      notes: quote.notes || '',
      items: quote.items.map((item) => ({
        product: item.product || '',
        name: item.name,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    });
    setFeedback('');
    setError('');
  };

  const handleDelete = async (quoteId) => {
    setError('');
    setFeedback('');

    try {
      const { message } = await deleteQuoteRequest(quoteId);
      setQuotes((prev) => prev.filter((quote) => quote._id !== quoteId));
      if (editingId === quoteId) {
        resetForm();
      }
      setFeedback(message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo eliminar la cotizacion.');
    }
  };

  const totalSales = quotes.reduce((sum, quote) => sum + quote.total, 0);
  const approvedQuotes = quotes.filter((quote) => quote.status === 'approved').length;

  const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });

  return (
    <div className="module-layout">
      <header className="module-header card">
        <div>
          <span className="eyebrow">Modulo</span>
          <h2>Ventas y cotizaciones</h2>
          <p>Administra cotizaciones con conceptos, estados y total calculado por la API.</p>
        </div>
        <span className="status-pill">{isLoading ? 'Cargando...' : 'API conectada'}</span>
      </header>

      <section className="dashboard-grid">
        <article className="card stat-card">
          <span className="stat-label">Cotizaciones</span>
          <strong>{quotes.length}</strong>
          <p>Documentos comerciales registrados para el usuario autenticado.</p>
        </article>

        <article className="card stat-card">
          <span className="stat-label">Aprobadas</span>
          <strong>{approvedQuotes}</strong>
          <p>Ventas con mayor avance dentro del ciclo comercial.</p>
        </article>

        <article className="card stat-card">
          <span className="stat-label">Monto total</span>
          <strong>{currencyFormatter.format(totalSales)}</strong>
          <p>Suma del total de todas las cotizaciones recuperadas.</p>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Quote Builder</span>
            <h2>{editingId ? 'Editar cotizacion' : 'Nueva cotizacion'}</h2>
          </div>
          {editingId ? (
            <button className="secondary-button" onClick={resetForm} type="button">
              Cancelar edicion
            </button>
          ) : null}
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label htmlFor="customerName">Cliente</label>
              <input
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={handleQuoteFieldChange}
                placeholder="Empresa Demo SA de CV"
                required
              />
            </div>

            <div>
              <label htmlFor="customerEmail">Correo del cliente</label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={form.customerEmail}
                onChange={handleQuoteFieldChange}
                placeholder="compras@empresa.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="description">Descripcion</label>
              <input
                id="description"
                name="description"
                value={form.description}
                onChange={handleQuoteFieldChange}
                placeholder="Cotizacion de equipo"
              />
            </div>

            <div>
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleQuoteFieldChange}
              >
                {quoteStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleQuoteFieldChange}
            placeholder="Vigencia de 15 dias"
            rows="3"
          />

          <div className="section-heading compact-heading">
            <div>
              <span className="eyebrow">Items</span>
              <h2>Conceptos</h2>
            </div>
            <button className="secondary-button" onClick={addItem} type="button">
              Agregar item
            </button>
          </div>

          <div className="quote-items">
            {form.items.map((item, index) => {
              const subtotal =
                (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

              return (
                <article className="quote-item-card" key={`${index}-${item.product}-${item.name}`}>
                  <div className="form-row">
                    <div>
                      <label htmlFor={`product-${index}`}>Producto opcional</label>
                      <select
                        id={`product-${index}`}
                        value={item.product}
                        onChange={(event) =>
                          handleItemChange(index, 'product', event.target.value)
                        }
                      >
                        <option value="">Captura manual</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`name-${index}`}>Concepto</label>
                      <input
                        id={`name-${index}`}
                        value={item.name}
                        onChange={(event) =>
                          handleItemChange(index, 'name', event.target.value)
                        }
                        placeholder="Laptop Lenovo ThinkPad"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div>
                      <label htmlFor={`quantity-${index}`}>Cantidad</label>
                      <input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          handleItemChange(index, 'quantity', event.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor={`unitPrice-${index}`}>Precio unitario</label>
                      <input
                        id={`unitPrice-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          handleItemChange(index, 'unitPrice', event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="item-footer">
                    <span className="status-pill">{currencyFormatter.format(subtotal)}</span>
                    <button
                      className="secondary-button"
                      onClick={() => removeItem(index)}
                      type="button"
                    >
                      Quitar item
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {feedback ? <p className="success-message">{feedback}</p> : null}
          {error ? <p className="error-message">{error}</p> : null}

          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Actualizar cotizacion' : 'Crear cotizacion'}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Sales Pipeline</span>
            <h2>Cotizaciones</h2>
          </div>
          <span className="status-pill">{isLoading ? 'Cargando...' : 'Sincronizado'}</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Items</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote._id}>
                  <td>
                    <strong>{quote.customerName}</strong>
                    <p className="table-note">{quote.customerEmail || 'Sin correo'}</p>
                  </td>
                  <td>
                    <span className={`status-pill status-${quote.status}`}>{quote.status}</span>
                  </td>
                  <td>
                    <p className="table-note">{quote.items.length} conceptos</p>
                    <p className="table-note">{quote.description || 'Sin descripcion'}</p>
                  </td>
                  <td>{currencyFormatter.format(quote.total)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary-button"
                        onClick={() => handleEdit(quote)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => downloadQuotePdf(quote)}
                        type="button"
                      >
                        PDF
                      </button>
                      <button onClick={() => handleDelete(quote._id)} type="button">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && quotes.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <p className="empty-state">
                      No hay cotizaciones todavia. Crea una desde el formulario.
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SalesPage;

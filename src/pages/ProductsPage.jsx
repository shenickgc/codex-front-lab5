import { useEffect, useState } from 'react';
import {
  createProductRequest,
  deleteProductRequest,
  getProductsRequest,
  updateProductRequest,
} from '../services/productService';

const initialForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
};

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const lowStockProducts = products.filter((product) => product.stock < 20).length;
  const inventoryValue = products.reduce(
    (total, product) => total + product.price * product.stock,
    0,
  );

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { products: productList } = await getProductsRequest();
        setProducts(productList);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || 'No se pudieron cargar los productos.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setFeedback('');

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: form.stock === '' ? 0 : Number(form.stock),
      };

      if (editingId) {
        const { product, message } = await updateProductRequest(editingId, payload);
        setProducts((prev) =>
          prev.map((item) => (item._id === editingId ? product : item)),
        );
        setFeedback(message);
      } else {
        const { product, message } = await createProductRequest(payload);
        setProducts((prev) => [product, ...prev]);
        setFeedback(message);
      }

      resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock ?? 0),
    });
    setFeedback('');
    setError('');
  };

  const handleDelete = async (productId) => {
    setError('');
    setFeedback('');

    try {
      const { message } = await deleteProductRequest(productId);
      setProducts((prev) => prev.filter((product) => product._id !== productId));
      if (editingId === productId) {
        resetForm();
      }
      setFeedback(message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo eliminar el producto.');
    }
  };

  const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });

  return (
    <div className="module-layout">
      <header className="module-header card">
        <div>
          <span className="eyebrow">Modulo</span>
          <h2>Productos</h2>
          <p>Alta, edicion y control del inventario desde el CRUD de tu backend.</p>
        </div>
        <span className="status-pill">{isLoading ? 'Cargando...' : 'API conectada'}</span>
      </header>

      <section className="dashboard-grid">
        <article className="card stat-card">
          <span className="stat-label">Productos activos</span>
          <strong>{products.length}</strong>
          <p>Inventario consultado en tiempo real desde la API.</p>
        </article>

        <article className="card stat-card">
          <span className="stat-label">Stock bajo</span>
          <strong>{lowStockProducts}</strong>
          <p>Equipos con menos de 20 unidades disponibles.</p>
        </article>

        <article className="card stat-card">
          <span className="stat-label">Valor estimado</span>
          <strong>{currencyFormatter.format(inventoryValue)}</strong>
          <p>Suma de precio por stock de todos los productos.</p>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Product Editor</span>
            <h2>{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
          </div>
          {editingId ? (
            <button className="secondary-button" onClick={resetForm} type="button">
              Cancelar edicion
            </button>
          ) : null}
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Laptop"
            required
          />

          <label htmlFor="description">Descripcion</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Equipo de trabajo"
            rows="3"
          />

          <div className="form-row">
            <div>
              <label htmlFor="price">Precio</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="15000"
                required
              />
            </div>

            <div>
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="3"
              />
            </div>
          </div>

          {feedback ? <p className="success-message">{feedback}</p> : null}
          {error ? <p className="error-message">{error}</p> : null}

          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Actualizar producto' : 'Crear producto'}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Live Inventory</span>
            <h2>Inventario</h2>
          </div>
          <span className="status-pill">{isLoading ? 'Cargando...' : 'Sincronizado'}</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Descripcion</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.description || 'Sin descripcion'}</td>
                  <td>
                    <span
                      className={
                        product.stock < 20 ? 'stock-badge stock-low' : 'stock-badge'
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>{currencyFormatter.format(product.price)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary-button"
                        onClick={() => handleEdit(product)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDelete(product._id)} type="button">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && products.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <p className="empty-state">
                      No hay productos todavia. Crea el primero desde el formulario.
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

export default ProductsPage;

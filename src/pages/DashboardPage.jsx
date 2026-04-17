import { useAuth } from '../context/AuthContext';

const mockProducts = [
  { id: 1, name: 'Laptop Pro 14', sku: 'LP-1400', stock: 22, price: '$1,450' },
  { id: 2, name: 'Mouse Inalambrico', sku: 'MI-240', stock: 81, price: '$35' },
  { id: 3, name: 'Monitor 4K 27"', sku: 'M4K-270', stock: 14, price: '$499' },
  { id: 4, name: 'Teclado Mecanico', sku: 'TM-101', stock: 45, price: '$120' },
];

function DashboardPage() {
  const { user, logout } = useAuth();
  const lowStockProducts = mockProducts.filter((product) => product.stock < 20).length;
  const inventoryValue = '$2,104';

  return (
    <main className="dashboard-layout">
      <header className="dashboard-header card">
        <div>
          <span className="eyebrow">Fleet Overview</span>
          <h1>Dashboard de productos</h1>
          <p>Bienvenido, {user?.username}.</p>
        </div>
        <button className="secondary-button" onClick={logout}>
          Cerrar sesi\u00f3n
        </button>
      </header>

      <section className="dashboard-grid">
        <article className="card stat-card">
          <span className="stat-label">Productos activos</span>
          <strong>{mockProducts.length}</strong>
          <p>Catalogo en linea con visual limpio y lectura inmediata.</p>
        </article>

        <article className="card stat-card">
          <span className="stat-label">Stock bajo</span>
          <strong>{lowStockProducts}</strong>
          <p>Equipos que conviene reabastecer antes del siguiente corte.</p>
        </article>

        <article className="card stat-card">
          <span className="stat-label">Valor estimado</span>
          <strong>{inventoryValue}</strong>
          <p>Resumen rapido para una lectura ejecutiva del inventario.</p>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Live Inventory</span>
            <h2>Inventario</h2>
          </div>
          <span className="status-pill">Actualizado hoy</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span
                      className={
                        product.stock < 20 ? 'stock-badge stock-low' : 'stock-badge'
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;

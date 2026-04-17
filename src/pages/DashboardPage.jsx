import { useAuth } from '../context/AuthContext';

const mockProducts = [
  { id: 1, name: 'Laptop Pro 14', sku: 'LP-1400', stock: 22, price: '$1,450' },
  { id: 2, name: 'Mouse Inalámbrico', sku: 'MI-240', stock: 81, price: '$35' },
  { id: 3, name: 'Monitor 4K 27"', sku: 'M4K-270', stock: 14, price: '$499' },
  { id: 4, name: 'Teclado Mecánico', sku: 'TM-101', stock: 45, price: '$120' },
];

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-layout">
      <header className="dashboard-header card">
        <div>
          <h1>Dashboard de productos</h1>
          <p>Bienvenido, {user?.username}.</p>
        </div>
        <button onClick={logout}>Cerrar sesión</button>
      </header>

      <section className="card">
        <h2>Inventario</h2>
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
                  <td>{product.stock}</td>
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

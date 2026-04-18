import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppShell() {
  const { user, logout } = useAuth();

  return (
    <main className="app-shell">
      <aside className="card sidebar">
        <div>
          <span className="eyebrow">Control Center</span>
          <h1 className="shell-title">Panel comercial</h1>
          <p className="shell-copy">
            Gestiona inventario y ventas desde modulos separados conectados a tu API.
          </p>
        </div>

        <nav className="nav-menu" aria-label="Navegacion principal">
          <NavLink
            to="/dashboard/products"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Productos
          </NavLink>
          <NavLink
            to="/dashboard/sales"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Ventas y cotizaciones
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.email}</p>
          </div>
          <button className="secondary-button" onClick={logout} type="button">
            Cerrar sesion
          </button>
        </div>
      </aside>

      <section className="shell-content">
        <Outlet />
      </section>
    </main>
  );
}

export default AppShell;

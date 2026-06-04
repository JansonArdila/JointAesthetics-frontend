import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import ProductDetail from './pages/ProductDetail';
import LogoJA from './assets/LogoJA.png';
import AdminOrders from './components/AdminOrders';
import backgroundTOTAL from './assets/backgroundTOTAL.png';
import OtroLogoTerminado from './assets/OtroLogoTerminado.png';


// Componente para proteger rutas
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/" />;
  }

  return children;
};

// Componente principal con navegación
const Layout = ({ children }) => {
  const { user, logout, cartItemsCount } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navBackgroundColor = '#1e2532';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <nav
        className="shadow-lg bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundTOTAL})`,
          backgroundColor: navBackgroundColor
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">

            {/* Logo izquierda */}
            <Link to="/">
              <img
                src={LogoJA}
                alt="JointAesthetics"
                className="h-14 md:h-24 w-auto transition-transform duration-300 hover:scale-110"
              />
            </Link>

            {/* Logo centro */}
            <img
              src={OtroLogoTerminado}
              alt="Joint Aesthetics"
              className="h-10 md:h-14 scale-[2.2] md:scale-[2.8] transition-transform duration-300 hover:scale-[3.5]"
            />

            {/* Botón hamburguesa (mobile) */}
            <button
              className="md:hidden bg-gray-200 px-3 py-2 rounded text-xl"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>

            {/* Menú Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLinks
                user={user}
                logout={logout}
                cartItemsCount={cartItemsCount}
              />
            </div>
          </div>

          {/* Menú Mobile */}
          {menuOpen && (
            <div className="md:hidden flex flex-col space-y-3 pb-4">
              <NavLinks
                user={user}
                logout={logout}
                cartItemsCount={cartItemsCount}
                mobile
              />
            </div>
          )}
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="flex-grow flex items-center justify-center">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Joint Aesthetics - Todos los derechos reservados</p>
          <p className="text-sm text-gray-400 mt-2">
            Sistema de gestión de inventario y ventas
          </p>
        </div>
      </footer>
    </div>
  );
};

/* ------------------ LINKS NAV ------------------ */
const NavLinks = ({ user, logout, cartItemsCount, mobile = false }) => {
  const baseBtn =
    "px-4 py-2 border border-slate-300 text-[#1e2532] bg-gray-200 rounded-md hover:bg-white hover:text-blue-600 transition-all duration-200";

  return (
    <>
      <Link to="/" className={baseBtn}>Inicio</Link>

      {user ? (
        <>
          {user.rol === 'ADMINISTRADOR' ? (
            <>
              <Link to="/admin" className={baseBtn}>Panel Admin</Link>
              <Link to="/inventory" className={baseBtn}>Inventario</Link>
              <Link to="/admin/orders" className={baseBtn}>Pedidos</Link>
            </>
          ) : (
            <>
              <Link to="/cart" className={`${baseBtn} relative`}>
                Carrito
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <Link to="/orders" className={baseBtn}>Mis Pedidos</Link>
            </>
          )}

          <div className={`flex items-center space-x-3 bg-black/20 px-3 py-2 rounded-full ${mobile ? '' : 'ml-4'}`}>
            <span className="text-white text-base font-medium">
              Hola, {user.nombre}
            </span>
            <button onClick={logout} className={baseBtn}>
              Cerrar Sesión
            </button>
          </div>
        </>
      ) : (
        <Link to="/login" className={baseBtn}>Iniciar Sesión</Link>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública - Home */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />

          {/* Nueva ruta pública - Detalle del producto */}
          <Route path="/product/:id" element={
            <Layout>
              <ProductDetail />
            </Layout>
          } />

          {/* Rutas de autenticación */}
          <Route path="/login" element={
            <Layout>
              <Login />
            </Layout>
          } />

          <Route path="/register" element={
            <Layout>
              <Register />
            </Layout>
          } />

          {/* Rutas protegidas - Usuario */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Layout>
                <Cart />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Ruta protegida - Admin */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Ruta protegida - Admin (Inventario detallado) */}
          <Route path="/inventory" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Ruta protegida - Admin (administrar pedidos) */}
          <Route path="/admin/orders" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminOrders />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

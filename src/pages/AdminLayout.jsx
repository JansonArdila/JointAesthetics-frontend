import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
                <h2 className="text-xl font-bold">ADMIN</h2>

                <NavLink
                    to="/admin/productos"
                    className={({ isActive }) =>
                        isActive ? "block font-bold text-blue-400" : "block"
                    }
                >
                    📦 Productos
                </NavLink>

                <NavLink
                    to="/admin/pedidos"
                    className={({ isActive }) =>
                        isActive ? "block font-bold text-blue-400" : "block"
                    }
                >
                    🧾 Pedidos
                </NavLink>
            </aside>

            <main className="flex-1 p-6 bg-gray-100">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, cartService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatters';
import { getImageUrl } from '../utils/getImageUrl';
import CategorySlider from '../components/CategorySlider';
import LogoJA from '../assets/LogoJA.png';



const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showAddCartModal, setShowAddCartModal] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [showWelcomeModal, setshowWelcomeModal] = useState(true);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    /*useEffect(() => {
        const seenModal = localStorage.getItem('seenWelcomeModal');
        if (!seenModal) {
            setshowWelcomeModal(true);
        }
    }, []);*/

    const fetchProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (err) {
            setError('Error al cargar productos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cerrar modal y marcarlo como visto

    const handleAccept = () => {
        setshowWelcomeModal(false);
        //localStorage.setItem('seenWelcomeModal', 'true');
    };

    const handleAddToCart = async (producto_id) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setAddingToCart(true);
            await cartService.addToCart(producto_id, 1);
            setShowAddCartModal(true);
        } catch (err) {
            setError('Error al agregar al carrito: ' + err.message);
        } finally {
            setAddingToCart(false);
        }
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => p.categoria === selectedCategory)
        : products;

    const categories = ['sudadera', 'buzo', 'camisilla', 'pantaloneta', 'camisa', 'top'];


    if (loading) return <div className="spinner"></div>;

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <CategorySlider onSelectCategory={(cat) => setSelectedCategory(cat)} />

            {/* Modal de BIENVENIDA*/}
            {showWelcomeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                        <img src={LogoJA} alt="JointAesthetics" className="mx-auto h-20 mb-4"></img>
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Bienvenido a JOINT AESTHETICS
                        </h2>
                        <div className="text-gray-700 mb-6 space-y-2 text-center">
                            <h3>Acá podrás visualizar y comprar tu ropa favorita</h3>
                            <p>1. Para realizar cualquier tipo de compra debes crear una cuenta en <strong>Joint Aesthetics</strong>. </p>
                            <p>2. Navega por las diferentes secciones de la prenda que te gusta.</p>
                            <p>3. Añade al carrito de compras la prenda que más te gustó justo con su cantidad.</p>
                            <p>4. <strong>TODA</strong> compra se debe hacer con un <strong>anticipo del 50% por NEQUI.</strong></p>
                            <p>5. Se requiere cargar el <strong>comprobante de pago</strong> (JPG, PNG, JPEG) para realizar la compra.</p>
                            <p>6. Una vez se realice la compra, el pedido tendrá el estado <strong>"PENDIENTE"</strong> mientras que se valida el anticipo.</p>
                            <p>7. Al validar el anticipo, el pedido pasará al estado <strong>"CONFIRMADO".</strong></p>
                        </div>
                        <div className="text-center">
                            <button
                                onClick={handleAccept}
                                className="btn-primary px-6 py-2 rounded"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-6">Nuestros Productos</h1>

            {/* Filtros */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded ${!selectedCategory ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded ${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Productos */}
            <div id="productos">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => {
                        const mainImage = product.imagenes?.find(img => img.es_principal) || product.imagenes?.[0];

                        return (
                            <div
                                key={product.id}
                                className="card group cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                {/* Enlace a detalle del producto */}
                                <Link to={`/product/${product.id}`} className="block">
                                    <div className="flex gap-2 p-2">

                                        {/* Miniaturas */}
                                        <div className="flex flex-col gap-2">
                                            {product.imagenes?.slice(0, 3).map((img, index) => (
                                                <img
                                                    key={img.id}
                                                    src={getImageUrl(img.imagen_nombre)}
                                                    className="w-16 h-16 object-cover rounded border cursor-pointer"
                                                    alt="miniatura"
                                                />
                                            ))}
                                        </div>

                                        {/* Imagen principal */}
                                        <div className="flex-shrink-0 ml-16 h-48 flex items-center">
                                            <img
                                                src={getImageUrl(mainImage?.imagen_nombre)}
                                                className="h-48 object-cover rounded"
                                                alt={product.nombre}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                                                    {product.nombre}
                                                </h3>
                                            </div>
                                            <span className="badge-primary">{product.categoria}</span>
                                        </div>

                                        <p className="text-gray-600 mb-2">Talla: {product.talla}</p>
                                        <p className="text-gray-600 mb-4">Stock: {product.cantidad} unidades</p>

                                        <div className="flex justify-between items-center">
                                            <span className="text-2xl font-bold text-primary-600">
                                                {formatPrice(product.precio)}
                                            </span>

                                            {/* Botón "Ver detalles" */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevenir navegación
                                                    navigate(`/product/${product.id}`);
                                                }}
                                                className="btn-outline text-sm"
                                            >
                                                Ver detalles
                                            </button>
                                        </div>
                                    </div>
                                </Link>

                                {/* Botón de agregar al carrito (fuera del Link) */}
                                <div className="px-4 pb-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evitar que se active el Link
                                            handleAddToCart(product.id);
                                        }}
                                        className="btn-primary w-full"
                                        disabled={product.cantidad === 0}
                                    >
                                        {product.cantidad === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {filteredProducts.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay productos en esta categoría</p>
            )}

            {/* 🟢 MODAL PRODUCTO AGREGADO */}
            {showAddCartModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">
                                Producto agregado
                            </h3>

                            <p className="text-gray-600 mb-6">
                                El producto fue agregado correctamente a tu carrito.
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowAddCartModal(false);
                                        navigate('/cart');
                                    }}
                                    className="btn-primary flex-1"
                                >
                                    Ir al carrito
                                </button>

                                <button
                                    onClick={() => setShowAddCartModal(false)}
                                    className="btn-outline flex-1"
                                >
                                    Seguir comprando
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;


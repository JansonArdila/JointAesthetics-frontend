import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, cartService, getImageUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatters';
import ProductImageGallery from '../components/ProductImageGallery';
import ImageModal from '../components/ImageModal';



const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showAddCartModal, setShowAddCartModal] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const data = await productService.getById(id);
            if (data.imagenes && data.imagenes.length > 0) {
                const mainIndex = data.imagenes.findIndex(img => img.es_principal);
                setSelectedImageIndex(mainIndex !== -1 ? mainIndex : 0);
            }
            setProduct(data);
            setError('');
        } catch (err) {
            setError('Error al cargar el producto: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/product/${id}` } });
            return;
        }

        try {
            setAddingToCart(true);
            await cartService.addToCart(product.id, quantity);
            setShowAddCartModal(true);
        } catch (err) {
            setError('Error al agregar al carrito: ' + err.message);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (!user) {
            navigate('/login', { state: { from: `/product/${id}` } });
            return;
        }

        handleAddToCart().then(() => {
            navigate('/cart');
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <div className="mt-4">
                    <Link to="/" className="btn-primary">
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                <Link to="/" className="btn-primary">
                    Volver al Inicio
                </Link>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4 py-8">
            {/* Navegación */}
            <div className="mb-6">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="text-gray-700 hover:text-blue-600">
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1 text-gray-500">Producto</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna izquierda: Galería de imágenes */}
                <div>
                    {/* Imagen principal */}
                    <div className="mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-center items-center">
                            {product.imagenes?.length > 0 ? (
                                <img
                                    src={getImageUrl(product.imagenes[selectedImageIndex].imagen_nombre)}
                                    alt={product.nombre}
                                    className="flex-shrink-0 w-96 h-96 object-cover rounded-lg"
                                    onClick={() => setShowModal(true)}
                                />
                            ) : (
                                <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-2 text-gray-500">Sin imagen</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Galería de miniaturas */}
                    {product.imagenes && product.imagenes.length > 1 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Más imágenes</h3>
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {product.imagenes.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 border rounded-lg overflow-hidden ${selectedImageIndex === index
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(image.imagen_nombre)}
                                            alt={`Imagen ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna derecha: Información del producto */}
                <div>
                    {/* Categoría y stock */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="badge-primary capitalize">{product.categoria}</span>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${product.cantidad > 10
                            ? 'bg-green-100 text-green-800'
                            : product.cantidad > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {product.cantidad > 10
                                ? 'Disponible'
                                : product.cantidad > 0
                                    ? 'Pocas unidades'
                                    : 'Agotado'
                            }
                        </div>
                    </div>

                    {/* Nombre del producto */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nombre}</h1>

                    {/* Precio */}
                    <div className="mb-6">
                        <p className="text-4xl font-bold text-primary-600">
                            {formatPrice(product.precio)}
                        </p>
                        <p className="text-sm text-gray-500">Precio unitario</p>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700">Talla</h4>
                                <p className="text-lg font-semibold">{product.talla}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700">Color</h4>
                                <div className="flex items-center mt-1">
                                    <div
                                        className="w-6 h-6 rounded-full border border-gray-300 mr-2"
                                        style={{ backgroundColor: product.color.toLowerCase() }}
                                        title={product.color}
                                    />
                                    <span className="font-medium">{product.color}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700">Stock disponible</h4>
                            <p className="text-2xl font-bold">{product.cantidad} unidades</p>
                        </div>
                    </div>

                    {/* Selector de cantidad y botones */}
                    <div className="border-t border-gray-200 pt-6">
                        {product.cantidad > 0 ? (
                            <>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cantidad
                                    </label>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-100"
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={product.cantidad}
                                            value={quantity}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value >= 1 && value <= product.cantidad) {
                                                    setQuantity(value);
                                                }
                                            }}
                                            className="w-16 h-10 text-center border-y border-gray-300"
                                        />
                                        <button
                                            onClick={() => setQuantity(prev => Math.min(product.cantidad, prev + 1))}
                                            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-100"
                                            disabled={quantity >= product.cantidad}
                                        >
                                            +
                                        </button>
                                        <span className="ml-3 text-sm text-gray-500">
                                            Máx: {product.cantidad} unidades
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                                        disabled={!user}
                                        title={!user ? "Debes iniciar sesión para agregar al carrito" : ""}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {user ? 'Agregar al Carrito' : 'Inicia sesión para comprar'}
                                    </button>

                                    {user && (
                                        <button
                                            onClick={handleBuyNow}
                                            className="btn-primary bg-green-600 hover:bg-green-700 flex-1 py-3 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Comprar Ahora
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-lg font-medium text-gray-900 mb-2">Producto agotado</p>
                                <p className="text-gray-600 mb-4">Este producto no está disponible por el momento</p>
                                <Link to="/" className="btn-primary">
                                    Ver otros productos
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Información adicional */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Información importante</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Envío gratis a Piedecuesta</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Pago contra entrega en la puerta de tu casa</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Sección de productos relacionados (opcional) */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">Aquí podrías mostrar productos de la misma categoría</p>
                    <Link to="/" className="btn-outline mt-4">
                        Ver todos los productos
                    </Link>
                </div>
            </div>
            {showModal && (
                <ImageModal
                    images={product.imagenes}
                    selectedIndex={selectedImageIndex}
                    onClose={() => setShowModal(false)}
                    onSelectImage={(index) => setSelectedImageIndex(index)}
                />
            )}

            {/* 🟢 MODAL PRODUCTO AGREGADO */}
            {showAddCartModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">
                                Producto agregado
                            </h3>

                            <p className="text-gray-600 mb-6">
                                Producto agregado al carrito exitosamente.
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

export default ProductDetail;
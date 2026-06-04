import React, { useState, useEffect } from 'react';
import { productService } from '../services/api';
import ProductForm from '../components/ProductForm';
import ProductCard from '../components/ProductCard';
import { formatPrice, formatNumber } from '../utils/formatters';
import { getImageUrl } from '../utils/getImageUrl';


const AdminPanel = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [modalMessage, setModalMessage] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const showMessageModal = ({ type = 'info', title = '', message = '', onConfirm = null }) => {
        setModalMessage({ type, title, message, onConfirm });
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar productos: ' + err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (productData) => {
        try {
            await productService.create(productData);
            setShowForm(false);
            await fetchProducts();
        } catch (err) {
            console.error('Error creando producto:', err);
            alert('Error al crear producto: ' + err.message);
        }
    };

    const handleUpdate = async (productData) => {
        try {
            await productService.update(editingProduct.id, productData);
            setEditingProduct(null);
            await fetchProducts();
        } catch (err) {
            console.error('Error actualizando producto:', err);
            alert('Error al actualizar producto: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        showMessageModal({
            type: 'confirm',
            title: '¿Eliminar producto?',
            message: 'Esto eliminará el producto y todas sus imágenes. Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await productService.delete(id);
                    await fetchProducts();
                } catch (err) {
                    console.error('Error eliminando producto:', err);
                    showMessageModal({
                        type: 'error',
                        title: 'Error',
                        message: 'Error al eliminar producto: ' + err.message
                    });
                }
            }
        });
    };

    const handleImageDelete = async (imageId) => {
        if (window.confirm('¿Estás seguro de eliminar esta imagen?')) {
            try {
                await productService.deleteImage(imageId);
                await fetchProducts();
            } catch (err) {
                console.error('Error eliminando imagen:', err);
                alert('Error al eliminar imagen: ' + err.message);
            }
        }
    };

    const handleSetMainImage = async (imageId) => {
        try {
            await productService.setMainImage(imageId);
            await fetchProducts();
        } catch (err) {
            console.error('Error marcando imagen como principal:', err);
            alert('Error al marcar imagen como principal: ' + err.message);
        }
    };

    const handleReorderImages = async (productId, newImageOrder) => {
        try {
            const ordenes = newImageOrder.map((img, index) => ({
                id: img.id,
                orden: index
            }));
            await productService.reorderImages(ordenes);
            await fetchProducts();
        } catch (err) {
            console.error('Error reordenando imágenes:', err);
            alert('Error al reordenar imágenes: ' + err.message);
        }
    };

    const handleFilterByCategory = async (category) => {
        try {
            setLoading(true);
            setSelectedCategory(category);

            if (category === '') {
                await fetchProducts();
            } else {
                const data = await productService.getByCategory(category);
                setProducts(data);
            }
            setError(null);
        } catch (err) {
            setError('Error al filtrar productos: ' + err.message);
            console.error('Error filtering products:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products;

    const categories = ['sudadera', 'buzo', 'camisilla', 'pantaloneta', 'camisa', 'top'];

    // Calcular estadísticas
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.precio) * parseInt(p.cantidad)), 0);
    const lowStockCount = products.filter(p => parseInt(p.cantidad) < 10).length;
    const totalImages = products.reduce((sum, p) => sum + (p.imagenes?.length || 0), 0);
    const totalStock = products.reduce((sum, p) => sum + parseInt(p.cantidad), 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Panel de Administración</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                    disabled={loading}
                >
                    + Nuevo Producto
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card text-center">
                    <h3 className="text-lg font-bold">Total Productos</h3>
                    <p className="text-3xl font-bold mt-2">{formatNumber(products.length, { decimals: 0 })}</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-lg font-bold">Valor Total</h3>
                    <p className="text-3xl font-bold mt-2">
                        {formatPrice(totalValue)}
                    </p>
                </div>
                <div className="card text-center">
                    <h3 className="text-lg font-bold">Stock Bajo</h3>
                    <p className="text-3xl font-bold mt-2 text-red-600">
                        {formatNumber(lowStockCount, { decimals: 0 })}
                    </p>
                </div>
                <div className="card text-center">
                    <h3 className="text-lg font-bold">Stock Total</h3>
                    <p className="text-3xl font-bold mt-2">
                        {formatNumber(totalStock, { decimals: 0 })}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleFilterByCategory('')}
                        className={`px-4 py-2 rounded transition-colors ${!selectedCategory ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        disabled={loading}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleFilterByCategory(cat)}
                            className={`px-4 py-2 rounded transition-colors ${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            disabled={loading}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Formularios */}
            {showForm && (
                <div className="mb-8">
                    <ProductForm
                        onSubmit={handleCreate}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {editingProduct && (
                <div className="mb-8">
                    <ProductForm
                        initialData={editingProduct}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingProduct(null)}
                    />
                </div>
            )}

            {/* Lista de productos */}
            {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay productos disponibles</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={setEditingProduct}
                            onDelete={handleDelete}
                            onImageDelete={handleImageDelete}
                            onSetMain={handleSetMainImage}
                        />
                    ))}
                </div>
            )}


            {modalMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                    ${modalMessage.type === 'error' ? 'bg-red-100' : modalMessage.type === 'confirm' ? 'bg-yellow-100' : 'bg-blue-100'}`}>

                                {modalMessage.type === 'error' && (
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}

                                {modalMessage.type === 'info' && (
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                    </svg>
                                )}

                                {modalMessage.type === 'confirm' && (
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold mb-2">{modalMessage.title}</h3>
                            <p className="text-gray-600 mb-6">{modalMessage.message}</p>

                            <div className="flex space-x-3">
                                {modalMessage.type === 'confirm' ? (
                                    <>
                                        <button
                                            onClick={() => setModalMessage(null)}
                                            className="btn-outline flex-1"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => {
                                                modalMessage.onConfirm?.();
                                                setModalMessage(null);
                                            }}
                                            className="btn-primary flex-1"
                                        >
                                            Confirmar
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            modalMessage.onConfirm?.();
                                            setModalMessage(null);
                                        }}
                                        className="btn-primary w-full"
                                    >
                                        Entendido
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
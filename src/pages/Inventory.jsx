import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import StatsCard from '../components/StatsCard';
import { productService } from '../services/api';
import { formatPrice, formatNumber } from '../utils/formatters';
import { getImageUrl } from '../utils/getImageUrl';


const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

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
        if (window.confirm('¿Estás seguro de eliminar este producto y todas sus imágenes?')) {
            try {
                await productService.delete(id);
                await fetchProducts();
            } catch (err) {
                console.error('Error eliminando producto:', err);
                alert('Error al eliminar producto: ' + err.message);
            }
        }
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
    const avgPrice = products.length > 0
        ? products.reduce((sum, p) => sum + parseFloat(p.precio), 0) / products.length
        : 0;
    const totalStock = products.reduce((sum, p) => sum + parseInt(p.cantidad), 0);

    // Calcular categorías únicas
    const uniqueCategories = [...new Set(products.map(p => p.categoria))].length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                    disabled={loading}
                >
                    + Nuevo Producto
                </button>
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

            {/* Estado de carga y error */}
            {loading && (
                <div className="flex justify-center my-8">
                    <div className="spinner"></div>
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Lista de productos */}
            {!loading && !error && filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos disponibles</h3>
                    <p className="text-gray-500 mb-6">Comienza agregando tu primer producto al inventario.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        + Crear Primer Producto
                    </button>
                </div>
            ) : (
                !loading && !error && (
                    <div className="space-y-6">
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
                )
            )}

            {/* Estadísticas */}
            {!loading && !error && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-6">Resumen del Inventario</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Total Productos"
                            value={products.length}
                            type="number"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            }
                            color="primary"
                        />

                        <StatsCard
                            title="Valor Total"
                            value={totalValue}
                            type="price"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            color="success"
                        />

                        <StatsCard
                            title="Stock Bajo"
                            value={lowStockCount}
                            type="number"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            }
                            color={lowStockCount > 0 ? 'danger' : 'success'}
                            subtitle={lowStockCount > 0 ? 'Necesita atención' : 'Todo en orden'}
                        />

                        <StatsCard
                            title="Total Imágenes"
                            value={totalImages}
                            type="number"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            }
                            color="info"
                            subtitle={`${products.length > 0 ? Math.round(totalImages / products.length) : 0} por producto`}
                        />
                    </div>

                    {/* Estadísticas detalladas */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4">Distribución por Categoría</h3>
                            <div className="space-y-3">
                                {categories.map(category => {
                                    const count = products.filter(p => p.categoria === category).length;
                                    const percentage = products.length > 0 ? (count / products.length * 100).toFixed(1) : 0;

                                    return (
                                        <div key={category} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                                                <span className="text-sm capitalize">{category}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-500 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{count}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-bold mb-4">Rendimiento del Stock</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Stock Total</span>
                                        <span className="font-bold">{formatNumber(totalStock, { decimals: 0 })} unidades</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${Math.min(100, (totalStock / 1000) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Precio Promedio</span>
                                        <span className="font-bold">{formatPrice(avgPrice)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${Math.min(100, (avgPrice / 1000) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Productos con Imágenes</span>
                                        <span className="font-bold">
                                            {products.filter(p => p.imagenes?.length > 0).length} de {products.length}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full"
                                            style={{ width: `${products.length > 0 ? (products.filter(p => p.imagenes?.length > 0).length / products.length * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-bold mb-4">Resumen Rápido</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Categorías Activas</span>
                                    <span className="font-bold">{uniqueCategories}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Sin Stock</span>
                                    <span className="font-bold text-red-600">
                                        {products.filter(p => p.cantidad === 0).length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Productos Destacados</span>
                                    <span className="font-bold">
                                        {products.filter(p => p.imagenes?.some(img => img.es_principal)).length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Valor Promedio por Producto</span>
                                    <span className="font-bold">
                                        {formatPrice(products.length > 0 ? totalValue / products.length : 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Instrucciones rápidas */}
            {!loading && !error && products.length > 0 && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-lg font-semibold text-blue-900 mb-2">Consejos de Gestión</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Haz clic en cualquier imagen para ver la galería completa del producto</li>
                                <li>• Puedes marcar una imagen como principal desde la galería</li>
                                <li>• Los productos con stock bajo se destacan en rojo</li>
                                <li>• Usa los filtros para ver productos por categoría específica</li>
                                <li>• Arrastra y suelta las miniaturas para reordenar imágenes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
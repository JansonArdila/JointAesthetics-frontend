import React, { useState, useEffect } from 'react';
import FormattedInput from './FormattedInput';
import { formatPrice } from '../utils/formatters';
import { getImageUrl } from '../utils/getImageUrl';


const ProductForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        categoria: 'sudadera',
        talla: 'M',
        color: '#3b82f6',
        cantidad: 0,
        precio: 0,
        imagenes: [], // Array de Files para nuevas imágenes
        imagenes_accion: 'agregar', // 'agregar' o 'reemplazar'
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categorias = [
        { value: 'sudadera', label: 'Sudadera (Pantalón)', icon: '🧥' },
        { value: 'buzo', label: 'Buzo', icon: '👕' },
        { value: 'camisilla', label: 'Camisilla', icon: '👚' },
        { value: 'pantaloneta', label: 'Pantaloneta', icon: '🩳' },
        { value: 'camisa', label: 'Camisa', icon: '👔' },
        { value: 'top', label: 'Top (Mujer)', icon: '👗' },
    ];

    const tallas = [
        { group: 'Letras', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { group: 'Números', sizes: ['28', '30', '32', '34', '36', '38'] },
    ];

    const coloresPredefinidos = [
        { nombre: 'Azul', valor: '#3b82f6' },
        { nombre: 'Rojo', valor: '#ef4444' },
        { nombre: 'Verde', valor: '#10b981' },
        { nombre: 'Negro', valor: '#000000' },
        { nombre: 'Blanco', valor: '#ffffff' },
        { nombre: 'Gris', valor: '#6b7280' },
        { nombre: 'Amarillo', valor: '#f59e0b' },
        { nombre: 'Rosado', valor: '#ec4899' },
    ];

    useEffect(() => {
        if (initialData) {
            const formattedData = {
                nombre: initialData.nombre,
                categoria: initialData.categoria,
                talla: initialData.talla,
                color: initialData.color,
                cantidad: parseInt(initialData.cantidad),
                precio: parseFloat(initialData.precio),
                imagenes: [],
                imagenes_accion: 'agregar'
            };
            setFormData(formattedData);

            // Guardar imágenes existentes para mostrar
            if (initialData.imagenes && Array.isArray(initialData.imagenes)) {
                setExistingImages(initialData.imagenes);
            }
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (formData.cantidad < 0) {
            newErrors.cantidad = 'La cantidad no puede ser negativa';
        }

        if (formData.precio <= 0) {
            newErrors.precio = 'El precio debe ser mayor a 0';
        }

        if (!formData.color) {
            newErrors.color = 'Selecciona un color';
        }

        // Validar imágenes (opcional, máximo 10)
        if (formData.imagenes.length > 10) {
            newErrors.imagenes = 'Máximo 10 imágenes por producto';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            const files = Array.from(e.target.files);

            // Validar número máximo de imágenes
            const totalImages = formData.imagenes.length + files.length;
            if (totalImages > 10) {
                setErrors(prev => ({
                    ...prev,
                    imagenes: `Máximo 10 imágenes. Ya tienes ${formData.imagenes.length} y estás intentando agregar ${files.length} más.`
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                imagenes: [...prev.imagenes, ...files]
            }));

            // Crear previews de las nuevas imágenes
            const newPreviews = files.map(file => ({
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size
            }));

            setImagePreviews(prev => [...prev, ...newPreviews]);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'cantidad' ? Number(value) : value
            }));
        }

        // Limpiar error del campo al cambiar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({ ...prev, color }));
        if (errors.color) {
            setErrors(prev => ({ ...prev, color: '' }));
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => {
            const newImagenes = [...prev.imagenes];
            newImagenes.splice(index, 1);
            return { ...prev, imagenes: newImagenes };
        });

        // Liberar URL del objeto y remover preview
        URL.revokeObjectURL(imagePreviews[index].url);
        setImagePreviews(prev => {
            const newPreviews = [...prev];
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const handleRemoveExistingImage = (imageId) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        // Nota: Esto solo remueve de la vista, la eliminación real se hace en el backend
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);

            // Limpiar previews después de enviar
            imagePreviews.forEach(preview => {
                URL.revokeObjectURL(preview.url);
            });
            setImagePreviews([]);
            setFormData(prev => ({ ...prev, imagenes: [] }));
        } catch (error) {
            console.error('Error en el formulario:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card max-w-6xl mx-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                    {initialData ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
                </h2>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-outline px-3 py-1.5"
                    >
                        Cancelar
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {/* Sección de Imágenes */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Imágenes del Producto ({existingImages.length + imagePreviews.length}/10)
                    </h3>

                    {/* Imágenes existentes (solo en edición) */}
                    {existingImages.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes existentes</h4>
                            <div className="flex flex-wrap gap-3">
                                {existingImages.map((image, index) => (
                                    <div key={image.id} className="relative group">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                                            <img
                                                src={image.url}
                                                alt={`Imagen existente ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(image.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Marcar para eliminar"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        {image.es_principal && (
                                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                                Principal
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nuevas imágenes */}
                    <div className="space-y-4">
                        {/* Previews de nuevas imágenes */}
                        {imagePreviews.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Nuevas imágenes ({imagePreviews.length})</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-300">
                                                <img
                                                    src={preview.url}
                                                    alt={`Nueva imagen ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                    title="Eliminar imagen"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500 truncate">
                                                {preview.name} ({(preview.size / 1024).toFixed(1)} KB)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Controles de subida */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {initialData ? 'Agregar más imágenes' : 'Subir imágenes'}
                            </label>
                            <div className="flex items-center">
                                <label className="flex-1 cursor-pointer">
                                    <div className="input-field flex items-center justify-center gap-2 py-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Seleccionar archivos
                                        <input
                                            type="file"
                                            name="imagenes"
                                            accept="image/*"
                                            onChange={handleChange}
                                            multiple
                                            className="hidden"
                                        />
                                    </div>
                                </label>
                            </div>
                            {errors.imagenes && (
                                <p className="mt-1 text-sm text-danger-500">{errors.imagenes}</p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                Formatos: JPG, PNG, GIF, WebP • Máx. 5MB por imagen • Máx. 10 imágenes
                            </p>
                        </div>

                        {/* Opción para reemplazar imágenes (solo en edición) */}
                        {initialData && existingImages.length > 0 && (
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Acción con imágenes existentes</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="imagenes_accion"
                                            value="agregar"
                                            checked={formData.imagenes_accion === 'agregar'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, imagenes_accion: e.target.value }))}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">Agregar nuevas imágenes a las existentes</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="imagenes_accion"
                                            value="reemplazar"
                                            checked={formData.imagenes_accion === 'reemplazar'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, imagenes_accion: e.target.value }))}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">Reemplazar todas las imágenes por las nuevas</span>
                                    </label>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    {formData.imagenes_accion === 'reemplazar'
                                        ? '⚠️ Todas las imágenes existentes serán eliminadas'
                                        : '✅ Las nuevas imágenes se agregarán a las existentes'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Producto *
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Ej: Sudadera con capota"
                            required
                        />
                        {errors.nombre && (
                            <p className="mt-1 text-sm text-danger-500">{errors.nombre}</p>
                        )}
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría *
                        </label>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            {categorias.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Talla */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Talla *
                        </label>
                        <select
                            name="talla"
                            value={formData.talla}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            <optgroup label="Letras">
                                {tallas[0].sizes.map(talla => (
                                    <option key={talla} value={talla}>{talla}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Números">
                                {tallas[1].sizes.map(talla => (
                                    <option key={talla} value={talla}>{talla}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color *
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => handleColorSelect(e.target.value)}
                                    className="w-12 h-12 cursor-pointer rounded-lg border border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => handleColorSelect(e.target.value)}
                                    className="input-field flex-1"
                                    placeholder="#000000"
                                />
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-2">Colores predefinidos:</p>
                                <div className="flex flex-wrap gap-2">
                                    {coloresPredefinidos.map(color => (
                                        <button
                                            key={color.valor}
                                            type="button"
                                            onClick={() => handleColorSelect(color.valor)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors ${formData.color === color.valor
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: color.valor }}
                                            />
                                            <span className="text-sm">{color.nombre}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {errors.color && (
                            <p className="mt-1 text-sm text-danger-500">{errors.color}</p>
                        )}
                    </div>

                    {/* Cantidad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad Disponible *
                        </label>
                        <input
                            type="number"
                            name="cantidad"
                            value={formData.cantidad}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            className="input-field"
                            required
                        />
                        {errors.cantidad && (
                            <p className="mt-1 text-sm text-danger-500">{errors.cantidad}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            {formData.cantidad === 0
                                ? '⚠️ Sin stock'
                                : formData.cantidad < 10
                                    ? '⚠️ Stock bajo'
                                    : '✅ Stock suficiente'}
                        </p>
                    </div>

                    {/* Precio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Unitario *
                        </label>
                        <FormattedInput
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            placeholder="0,00"
                            decimals={2}
                            prefix="$"
                            required
                        />
                        {errors.precio && (
                            <p className="mt-1 text-sm text-danger-500">{errors.precio}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            Valor total: <span className="font-bold">
                                {formatPrice(formData.precio * formData.cantidad)}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Vista Previa */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vista previa</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-20 h-20 rounded-lg border border-gray-300"
                                style={{ backgroundColor: formData.color }}
                            />
                            <div>
                                <h4 className="font-medium">{formData.nombre || 'Nombre del producto'}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="badge-primary">{formData.categoria}</span>
                                    <span className="text-sm text-gray-600">Talla: {formData.talla}</span>
                                </div>
                                <p className="text-lg font-bold text-primary-600 mt-2">
                                    {formatPrice(formData.precio)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-6 py-2.5 flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="spinner w-4 h-4"></div>
                            Procesando...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {initialData ? 'Actualizar Producto' : 'Crear Producto'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
/**
 * Formatea un número con separadores de miles y decimales
 * @param {number|string} value - Valor a formatear
 * @param {Object} options - Opciones de formateo
 * @param {number} options.decimals - Número de decimales (default: 2)
 * @param {string} options.thousandsSeparator - Separador de miles (default: '.')
 * @param {string} options.decimalSeparator - Separador decimal (default: ',')
 * @returns {string} Número formateado
 */
export const formatNumber = (value, options = {}) => {
    const {
        decimals = 2,
        thousandsSeparator = '.',
        decimalSeparator = ','
    } = options;

    // Convertir a número
    let number = typeof value === 'string' ? parseFloat(value) : value;

    // Validar que sea un número válido
    if (isNaN(number)) {
        return '0,00';
    }

    // Redondear a los decimales especificados
    number = parseFloat(number.toFixed(decimals));

    // Separar parte entera y decimal
    const parts = number.toString().split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1] || '0'.repeat(decimals);

    // Agregar separadores de miles a la parte entera
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

    // Formatear parte decimal
    let formattedDecimal = decimalPart;
    if (decimals > 0) {
        formattedDecimal = decimalPart.padEnd(decimals, '0').substring(0, decimals);
    }

    // Unir las partes
    if (decimals > 0) {
        return `${integerPart}${decimalSeparator}${formattedDecimal}`;
    } else {
        return integerPart;
    }
};

/**
 * Formatea un precio monetario
 * @param {number|string} price - Precio a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {string} Precio formateado con símbolo de moneda
 */
export const formatPrice = (price, options = {}) => {
    const {
        symbol = '$',
        decimals = 2,
        showSymbol = true
    } = options;

    const formatted = formatNumber(price, { decimals });

    if (showSymbol) {
        return `${symbol} ${formatted}`;
    }

    return formatted;
};

/**
 * Formatea una cantidad sin decimales
 * @param {number|string} quantity - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
export const formatQuantity = (quantity) => {
    return formatNumber(quantity, { decimals: 0 });
};

/**
 * Formatea un valor monetario grande (miles, millones, etc.)
 * @param {number|string} value - Valor a formatear
 * @returns {string} Valor formateado
 */
export const formatLargeNumber = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0';

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1).replace('.', ',')}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1).replace('.', ',')}K`;
    }

    return formatNumber(num, { decimals: 0 });
};

/**
 * Formatea un input mientras se escribe
 * @param {string} value - Valor del input
 * @param {boolean} allowDecimals - Permite decimales
 * @returns {string} Valor formateado
 */
export const formatInput = (value, allowDecimals = true) => {
    // Eliminar todo excepto números y puntos decimales
    let cleaned = value.replace(/[^\d,.-]/g, '');

    // Reemplazar comas por puntos para procesamiento interno
    cleaned = cleaned.replace(',', '.');

    // Permitir solo un punto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Si no se permiten decimales, eliminar el punto
    if (!allowDecimals) {
        cleaned = cleaned.replace('.', '');
    }

    return cleaned;
};

/**
 * Convierte un string formateado a número
 * @param {string} formattedValue - Valor formateado
 * @returns {number} Número
 */
export const parseFormattedNumber = (formattedValue) => {
    if (!formattedValue) return 0;

    // Reemplazar separadores de miles
    let cleaned = formattedValue.replace(/\./g, '');

    // Reemplazar coma decimal por punto
    cleaned = cleaned.replace(',', '.');

    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
};

/**
 * Hook personalizado para formatear números en inputs
 * @param {Object} options - Opciones
 * @returns {Object} Funciones de utilidad
 */
export const useNumberFormat = (options = {}) => {
    const defaultOptions = {
        decimals: 2,
        thousandsSeparator: '.',
        decimalSeparator: ',',
        allowNegative: false,
        ...options
    };

    const format = (value) => {
        return formatNumber(value, defaultOptions);
    };

    const parse = (formattedValue) => {
        return parseFormattedNumber(formattedValue);
    };

    const formatInputValue = (value) => {
        return formatInput(value, defaultOptions.decimals > 0);
    };

    return { format, parse, formatInputValue };
};
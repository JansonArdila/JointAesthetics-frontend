import React, { useState, useEffect } from 'react';
import { formatInput, formatNumber, parseFormattedNumber } from '../utils/formatters';

const FormattedInput = ({
    value,
    onChange,
    name,
    placeholder = '0,00',
    decimals = 2,
    allowNegative = false,
    className = '',
    label = '',
    required = false,
    disabled = false,
    prefix = '',
    suffix = '',
    ...props
}) => {
    const [displayValue, setDisplayValue] = useState('');
    const [rawValue, setRawValue] = useState(value || 0);
    const [isFocused, setIsFocused] = useState(false);

    // Inicializar valores
    useEffect(() => {
        if (value !== undefined && value !== null) {
            setRawValue(value);
            setDisplayValue(formatNumber(value, { decimals }));
        }
    }, [value, decimals]);

    const handleFocus = (e) => {
        setIsFocused(true);
        // Mostrar el valor sin formatear mientras se editar
        setDisplayValue(rawValue.toString().replace('.', ','));
        if (props.onFocus) props.onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);

        // Validar y formatear el valor
        let newValue = parseFormattedNumber(displayValue);

        if (isNaN(newValue)) {
            newValue = 0;
        }

        if (!allowNegative && newValue < 0) {
            newValue = 0;
        }

        // Redondear a los decimales especificados
        newValue = parseFloat(newValue.toFixed(decimals));

        setRawValue(newValue);
        setDisplayValue(formatNumber(newValue, { decimals }));

        // Notificar al padre
        if (onChange) {
            const syntheticEvent = {
                target: {
                    name,
                    value: newValue
                }
            };
            onChange(syntheticEvent);
        }

        if (props.onBlur) props.onBlur(e);
    };

    const handleChange = (e) => {
        const inputValue = e.target.value;

        // Limpiar el valor para procesamiento
        let cleaned = formatInput(inputValue, decimals > 0);

        // No permitir negativo si no está permitido
        if (!allowNegative && cleaned.startsWith('-')) {
            cleaned = cleaned.substring(1);
        }

        // Permitir solo un signo negativo al inicio
        if (allowNegative && cleaned.includes('-')) {
            cleaned = '-' + cleaned.replace(/-/g, '');
        }

        // Actualizar valor mostrado
        setDisplayValue(cleaned);

        // Parsear para mantener rawValue actualizado
        const parsed = parseFormattedNumber(cleaned);
        if (!isNaN(parsed)) {
            setRawValue(parsed);
        }
    };

    const handleKeyDown = (e) => {
        // Permitir solo números, puntos, comas y teclas de control
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
        ];

        const isNumber = /[0-9]/.test(e.key);
        const isDecimalSeparator = [',', '.'].includes(e.key);
        const isAllowedKey = allowedKeys.includes(e.key);

        if (!isNumber && !isDecimalSeparator && !isAllowedKey) {
            e.preventDefault();
        }

        if (props.onKeyDown) props.onKeyDown(e);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {prefix}
                    </span>
                )}

                <input
                    type="text"
                    name={name}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${prefix ? 'pl-8' : ''
                        } ${suffix ? 'pr-8' : ''} ${className}`}
                    required={required}
                    {...props}
                />

                {suffix && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {suffix}
                    </span>
                )}
            </div>

            {!isFocused && rawValue > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                    {prefix}
                    {formatNumber(rawValue, { decimals, thousandsSeparator: '.', decimalSeparator: ',' })}
                    {suffix}
                </div>
            )}
        </div>
    );
};

export default FormattedInput;
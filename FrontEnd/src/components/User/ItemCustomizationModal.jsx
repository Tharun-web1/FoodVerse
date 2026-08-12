import React, { useState } from 'react';
import { FiX, FiCheck, FiPlus, FiMinus } from 'react-icons/fi';
import '../UserCss/ItemCustomizationModal.css';

const ItemCustomizationModal = ({ item, isOpen, onClose, onConfirm }) => {
    if (!isOpen || !item) return null;

    const basePrice = item.price || 0;

    // Variants/Sizes
    const variants = item.variants || [
        { id: 'regular', name: 'Regular Size', extraPrice: 0 },
        { id: 'medium', name: 'Medium Portion (+₹60)', extraPrice: 60 },
        { id: 'large', name: 'Large / Feast (+₹120)', extraPrice: 120 },
    ];

    // Add-Ons / Toppings
    const addOnsList = item.addOns || [
        { id: 'cheese', name: 'Extra Cheese', price: 35 },
        { id: 'dip', name: 'Signature Garlic Dip', price: 25 },
        { id: 'sauce', name: 'Spicy Peri Peri Sauce', price: 20 },
    ];

    const [selectedVariant, setSelectedVariant] = useState(variants[0]);
    const [selectedAddOns, setSelectedAddOns] = useState([]);
    const [note, setNote] = useState('');
    const [quantity, setQuantity] = useState(1);

    const toggleAddOn = (addon) => {
        setSelectedAddOns(prev => {
            const exists = prev.some(a => a.id === addon.id);
            if (exists) {
                return prev.filter(a => a.id !== addon.id);
            } else {
                return [...prev, addon];
            }
        });
    };

    const addOnsTotal = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
    const unitPrice = basePrice + selectedVariant.extraPrice + addOnsTotal;
    const finalTotal = unitPrice * quantity;

    const handleAddToCart = () => {
        const configuredItem = {
            ...item,
            configuredVariant: selectedVariant,
            configuredAddOns: selectedAddOns,
            configuredPrice: unitPrice,
            specialInstructions: note,
            quantity: quantity,
            // Create a unique composite key for customized item
            customKey: `${item.id}-${selectedVariant.id}-${selectedAddOns.map(a => a.id).join('_')}`
        };

        if (onConfirm) {
            onConfirm(configuredItem, quantity);
        }
        onClose();
    };

    return (
        <div className="item-custom-overlay" onClick={onClose}>
            <div className="item-custom-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="custom-modal-header">
                    <div className="custom-item-meta">
                        {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="custom-item-thumb" />
                        )}
                        <div className="custom-item-title-group">
                            <h3>{item.name}</h3>
                            <p>Base Price: ₹{basePrice}</p>
                        </div>
                    </div>
                    <button className="custom-close-btn" onClick={onClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>

                {/* Body */}
                <div className="custom-modal-body">
                    {/* Portion Size Selection */}
                    <div className="custom-section-block">
                        <h4>
                            <span>Choose Portion Size</span>
                            <span className="required-tag">REQUIRED</span>
                        </h4>
                        <div className="custom-options-list">
                            {variants.map(varOpt => (
                                <div 
                                    key={varOpt.id} 
                                    className={`custom-option-label ${selectedVariant.id === varOpt.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedVariant(varOpt)}
                                >
                                    <div className="opt-left">
                                        <input 
                                            type="radio" 
                                            name="variant" 
                                            checked={selectedVariant.id === varOpt.id} 
                                            onChange={() => setSelectedVariant(varOpt)}
                                        />
                                        <span>{varOpt.name}</span>
                                    </div>
                                    <span className="opt-price">
                                        {varOpt.extraPrice > 0 ? `+₹${varOpt.extraPrice}` : 'Free'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add-Ons Section */}
                    <div className="custom-section-block">
                        <h4>
                            <span>Select Add-Ons & Extras</span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Optional</span>
                        </h4>
                        <div className="custom-options-list">
                            {addOnsList.map(addon => {
                                const isChecked = selectedAddOns.some(a => a.id === addon.id);
                                return (
                                    <div 
                                        key={addon.id} 
                                        className={`custom-option-label ${isChecked ? 'selected' : ''}`}
                                        onClick={() => toggleAddOn(addon)}
                                    >
                                        <div className="opt-left">
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked} 
                                                onChange={() => toggleAddOn(addon)}
                                            />
                                            <span>{addon.name}</span>
                                        </div>
                                        <span className="opt-price">+₹{addon.price}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Special Instructions Note */}
                    <div className="custom-section-block">
                        <h4>Special Cooking Notes</h4>
                        <textarea 
                            className="custom-instructions-input"
                            placeholder="E.g., Less spicy, extra sauce packets, no onions..."
                            rows="2"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="custom-modal-footer">
                    <div className="custom-quantity-selector">
                        <button 
                            className="custom-qty-btn" 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <FiMinus />
                        </button>
                        <span className="custom-qty-val">{quantity}</span>
                        <button 
                            className="custom-qty-btn" 
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <FiPlus />
                        </button>
                    </div>

                    <button className="add-custom-item-btn" onClick={handleAddToCart}>
                        <span>Add Item</span>
                        <span>₹{finalTotal}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemCustomizationModal;

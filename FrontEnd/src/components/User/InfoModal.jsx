import React from 'react';
import { FiX } from 'react-icons/fi';
import '../UserCss/InfoModal.css';

const InfoModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="info-modal-overlay" onClick={onClose}>
            <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="info-modal-header">
                    <h3>{title}</h3>
                    <button className="info-close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>
                <div className="info-modal-body">
                    <div className="info-text-container">
                        {content ? (
                            <p className="info-text">{content}</p>
                        ) : (
                            <div className="no-info-msg">No information available yet.</div>
                        )}
                    </div>
                </div>
                <div className="info-modal-footer">
                    <button className="info-done-btn" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;

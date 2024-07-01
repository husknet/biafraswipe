import React from 'react';
import './Modal.css';

const Modal = ({ message }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="spinner"></div>
        <div className="message-bar">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;

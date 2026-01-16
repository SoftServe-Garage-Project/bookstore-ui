import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import styles from './AddToCartModal.module.css';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookImage: string | null;
  quantity: number;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ 
  isOpen, 
  onClose, 
  bookTitle, 
  bookImage, 
  quantity 
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeIcon} onClick={onClose}>&times;</button>
        
        <div className={styles.successHeader}>
          <span className={styles.checkIcon}>✓</span>
          <h3>Added to Cart</h3>
        </div>

        <div className={styles.content}>
          <div className={styles.imageWrapper}>
            {bookImage ? (
              <img src={bookImage} alt={bookTitle} />
            ) : (
              <div className={styles.placeholder}>No Image</div>
            )}
          </div>
          <div className={styles.details}>
            <p className={styles.title}>{bookTitle}</p>
            <p className={styles.qty}>Quantity: <strong>{quantity}</strong></p>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} className={styles.fullWidthMobile}>
            Continue Shopping
          </Button>
          <Button variant="primary" onClick={() => navigate('/cart')} className={styles.fullWidthMobile}>
            Go to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
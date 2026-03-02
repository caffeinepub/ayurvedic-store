import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Zap, Star, Package } from 'lucide-react';
import { Product, ProductStatus } from '../backend';
import { useCart } from '../context/CartContext';
import { useGetRazorpayKeyId } from '../hooks/useQueries';
import { useRazorpay } from '../hooks/useRazorpay';
import { toast } from 'sonner';
import StatusBadge from './admin/StatusBadge';
import DeliveryDetailsModal, { DeliveryFormData } from './DeliveryDetailsModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: razorpayKeyId } = useGetRazorpayKeyId();
  const { openCheckout, isCreatingOrder } = useRazorpay();
  const [buyingNow, setBuyingNow] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  if (product.status === ProductStatus.notVisible) return null;

  const isOutOfStock = product.status === ProductStatus.outOfStock || product.stockQuantity === BigInt(0);
  const isLaunchingSoon = product.status === ProductStatus.launchingSoon;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isLaunchingSoon) return;
    addItem({
      productId: product.id,
      name: product.name,
      priceInr: product.priceInr,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isLaunchingSoon || !razorpayKeyId) return;
    setShowDeliveryModal(true);
  };

  const handleDeliverySubmit = async (deliveryData: DeliveryFormData) => {
    if (!razorpayKeyId) return;
    setBuyingNow(true);
    try {
      const deliveryInfo = {
        fullName: deliveryData.fullName,
        address: deliveryData.address,
        phoneNumber: deliveryData.phoneNumber,
      };

      setShowDeliveryModal(false);

      await openCheckout({
        keyId: razorpayKeyId,
        amount: Number(product.priceInr) * 100,
        name: 'Nature Glow',
        description: product.name,
        orderInput: {
          items: [{ productId: product.id, quantity: BigInt(1), unitPrice: product.priceInr }],
          deliveryInfo,
          guestDeliveryInfo: deliveryInfo,
          totalAmount: product.priceInr,
          razorpayOrderId: `order_${Date.now()}`,
          razorpayPaymentId: '',
        },
        prefill: {
          name: deliveryData.fullName,
          contact: deliveryData.phoneNumber,
        },
      });
    } catch (err) {
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <>
      <div
        className="group bg-white rounded-2xl overflow-hidden border border-forest/10 hover:border-gold/30 hover:shadow-botanical transition-all duration-300 cursor-pointer"
        onClick={() => navigate({ to: '/product/$id', params: { id: product.id.toString() } })}
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-sage/20">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/generated/product-neem.dim_600x600.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-forest/20" />
            </div>
          )}

          {/* Status badge overlay */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={product.status} size="sm" />
          </div>

          {/* Featured star */}
          {product.isFeatured && (
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gold/90 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-white text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-1">
            <span className="text-forest/50 text-xs uppercase tracking-wide">{product.category}</span>
          </div>
          <h3 className="font-serif text-lg text-forest mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-forest/60 text-xs mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-forest text-lg">₹{product.priceInr.toString()}</span>
            {product.stockQuantity > BigInt(0) && !isOutOfStock && (
              <span className="text-forest/40 text-xs">{product.stockQuantity.toString()} left</span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLaunchingSoon}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-forest/10 hover:bg-forest/20 text-forest text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              {isLaunchingSoon ? 'Coming Soon' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            {!isOutOfStock && !isLaunchingSoon && razorpayKeyId && (
              <button
                onClick={handleBuyNowClick}
                disabled={buyingNow || isCreatingOrder}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gold hover:bg-gold-dark text-forest text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {buyingNow ? 'Processing...' : 'Buy Now'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        open={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onSubmit={handleDeliverySubmit}
        isLoading={buyingNow || isCreatingOrder}
        productName={product.name}
      />
    </>
  );
}

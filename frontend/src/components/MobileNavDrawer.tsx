import React from 'react';
import { Link } from '@tanstack/react-router';
import { X, Leaf, Home, ShoppingBag, LogIn, LogOut } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
    isLoggingIn: boolean;
    onAuth: () => void;
}

export default function MobileNavDrawer({ isOpen, onClose, isAuthenticated, isLoggingIn, onAuth }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Drawer */}
            <div className="absolute top-0 left-0 bottom-0 w-72 bg-card shadow-herb-lg flex flex-col animate-slide-in-right">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-primary" />
                        <span className="font-serif text-xl font-semibold text-foreground">Nature Glow</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5 text-foreground" />
                    </button>
                </div>

                <nav className="flex-1 p-5 space-y-2">
                    <Link
                        to="/"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-foreground font-medium"
                    >
                        <Home className="w-4 h-4 text-primary" />
                        Home
                    </Link>
                    <Link
                        to="/shop"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-foreground font-medium"
                    >
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        Shop
                    </Link>
                </nav>

                <div className="p-5 border-t border-border">
                    <button
                        onClick={() => { onAuth(); onClose(); }}
                        disabled={isLoggingIn}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-foreground font-medium disabled:opacity-50"
                    >
                        {isAuthenticated ? (
                            <><LogOut className="w-4 h-4 text-primary" /> Logout</>
                        ) : (
                            <><LogIn className="w-4 h-4 text-primary" /> {isLoggingIn ? 'Logging in…' : 'Admin Login'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

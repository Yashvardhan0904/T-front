'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Store, Shield, Headphones } from 'lucide-react';

const ROLES = [
    { value: 'CUSTOMER', label: 'Customer', icon: ShoppingCart },
    { value: 'SELLER', label: 'Seller', icon: Store },
    { value: 'ADMIN', label: 'Admin', icon: Shield },
    { value: 'CUSTOMER_CARE', label: 'Support', icon: Headphones },
];

export default function RoleSwitcher() {
    const { user, role, intelligenceLevel, updateUser } = useAuth() as any;
    const [isSwitching, setIsSwitching] = useState(false);

    // Only show if sophisticated
    if (intelligenceLevel !== 'sophisticated') return null;

    async function handleRoleSwitch(targetRole: string) {
        if (targetRole === role) return;

        setIsSwitching(true);
        try {
            const response = await fetch('/api/auth/switch-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // assuming it's in localStorage too, or server will use cookies
                },
                body: JSON.stringify({ role: targetRole }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update the user state locally
                    updateUser(data.user);
                    window.location.reload(); // Quickest way to re-init everything with new role
                }
            } else {
                const error = await response.json();
                alert(`Role switch failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Role switch failed:', error);
            alert('An error occurred during role switch.');
        } finally {
            setIsSwitching(false);
        }
    }

    return (
        <div className="px-4 py-2 border-t bg-gray-50 rounded-b-lg">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">
                Switch Role (Sophisticated Mode)
            </p>
            <div className="grid grid-cols-2 gap-1">
                {ROLES.map((r) => (
                    <button
                        key={r.value}
                        disabled={isSwitching || role === r.value}
                        onClick={() => handleRoleSwitch(r.value)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-all ${role === r.value
                            ? 'bg-amber-100 text-amber-700 font-bold border border-amber-200'
                            : 'text-gray-600 hover:bg-white hover:shadow-sm border border-transparent'
                            } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <r.icon className="w-3 h-3" />
                        <span>{r.label}</span>
                    </button>
                ))}
            </div>
            {isSwitching && (
                <div className="mt-2 flex justify-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-500"></div>
                </div>
            )}
        </div>
    );
}

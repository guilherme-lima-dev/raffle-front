"use client";

import { useState } from 'react';
import axios from 'axios';

export default function OrderApprovalPage() {
    const [orderId, setOrderId] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleApprove = async () => {
        try {
            await axios.get(`http://ec2-44-201-203-12.compute-1.amazonaws.com/orders/${orderId}/approve`, {
                headers: {
                    accept: 'application/json',
                },
            });
            setMessage(`Order ${orderId} approved successfully!`);
            setError(null);
        } catch (err) {
            setError(`Failed to approve order ${orderId}.`);
            setMessage(null);
        }
    };

    const handleReject = async () => {
        try {
            await axios.get(`http://ec2-44-201-203-12.compute-1.amazonaws.com/orders/${orderId}/reject`, {
                headers: {
                    accept: 'application/json',
                },
            });
            setMessage(`Order ${orderId} rejected successfully!`);
            setError(null);
        } catch (err) {
            setError(`Failed to reject order ${orderId}.`);
            setMessage(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-black">Aprove ou rejeite os pedidos</h1>

            <input
                type="text"
                placeholder="Enter Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="px-4 py-2 border rounded-md mb-4 text-black"
            />

            <div className="flex space-x-4">
                <button
                    onClick={handleApprove}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    Approve Order
                </button>
                <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Reject Order
                </button>
            </div>

            {/* Exibir mensagem de sucesso ou erro */}
            {message && <p className="text-green-500 mt-4">{message}</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}

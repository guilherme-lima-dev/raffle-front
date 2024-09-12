"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

// Interface para tipagem dos pedidos
interface Order {
    id: number;
    customer_name: string;
    status: string;
    external_id: string;
}

export default function OrderApprovalPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Carrega todos os pedidos ao montar o componente
        const fetchOrders = async () => {
            try {
                const response = await axios.get('https://raffle.popingressos.com.br/orders', {
                    headers: {
                        accept: 'application/json',
                    },
                });
                setOrders(response.data);
                setFilteredOrders(response.data); // Inicializa a lista filtrada
            } catch (err) {
                console.error('Failed to fetch orders', err);
            }
        };

        fetchOrders();
    }, []);

    // Função para filtrar pedidos por nome do cliente
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setFilter(searchTerm);
        setFilteredOrders(
            orders.filter((order) =>
                order.customer_name.toLowerCase().includes(searchTerm)
            )
        );
    };

    const handleApprove = async (orderId: number) => {
        try {
            await axios.get(`https://raffle.popingressos.com.br/orders/${orderId}/approve`, {
                headers: {
                    accept: 'application/json',
                },
            });
            setMessage(`Order ${orderId} approved successfully!`);
            setError(null);

            // Atualiza o status do pedido na lista
            setFilteredOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: 'paid' } : order
                )
            );
        } catch (err) {
            setError(`Failed to approve order ${orderId}.`);
            setMessage(null);
        }
    };

    const handleReject = async (orderId: number) => {
        try {
            await axios.get(`https://raffle.popingressos.com.br/orders/${orderId}/reject`, {
                headers: {
                    accept: 'application/json',
                },
            });
            setMessage(`Order ${orderId} rejected successfully!`);
            setError(null);

            // Atualiza o status do pedido na lista
            setFilteredOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: 'rejected' } : order
                )
            );
        } catch (err) {
            setError(`Failed to reject order ${orderId}.`);
            setMessage(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-6 text-center text-black">Aprovar ou Rejeitar Pedidos</h1>

            {/* Filtro por nome do cliente */}
            <input
                type="text"
                placeholder="Filtrar por nome do cliente"
                value={filter}
                onChange={handleFilterChange}
                className="block w-full max-w-lg mx-auto mb-6 px-4 py-2 border rounded-md text-black"
            />

            {/* Contador de pedidos no topo */}
            <p className="mb-4 text-center text-black">Total de Pedidos: {filteredOrders.length}</p>

            {/* Lista de pedidos em formato de cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2 text-black">Pedido #{order.id}</h3>
                        <p className="text-gray-700 mb-2"><strong>Cliente:</strong> {order.customer_name}</p>
                        <p className="text-gray-700 mb-4"><strong>Status:</strong> {order.status}</p>
                        <div className="flex justify-between">
                            <button
                                onClick={() => handleApprove(order.id)}
                                className={`w-full mr-2 py-2 rounded-lg text-white ${
                                    order.status === 'paid'
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600'
                                }`}
                                disabled={order.status === 'approved'}
                            >
                                Aprovar
                            </button>
                            <button
                                onClick={() => handleReject(order.id)}
                                className={`w-full py-2 rounded-lg text-white ${
                                    order.status === 'rejected'
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600'
                                }`}
                                disabled={order.status === 'rejected'}
                            >
                                Rejeitar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Exibir mensagem de sucesso ou erro */}
            {message && <p className="text-green-500 mt-6 text-center">{message}</p>}
            {error && <p className="text-red-500 mt-6 text-center">{error}</p>}

            {/* Contador de pedidos no final */}
            <p className="mt-6 text-center text-black">Total de Pedidos: {filteredOrders.length}</p>
        </div>
    );
}

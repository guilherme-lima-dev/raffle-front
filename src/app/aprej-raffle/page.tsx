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
                    order.id === orderId ? { ...order, status: 'approved' } : order
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-black">Aprovar ou Rejeitar Pedidos</h1>

            {/* Filtro por nome do cliente */}
            <input
                type="text"
                placeholder="Filtrar por nome do cliente"
                value={filter}
                onChange={handleFilterChange}
                className="px-4 py-2 border rounded-md mb-4 text-black"
            />

            {/* Contador de pedidos no topo */}
            <p className="mb-4 text-black">Total de Pedidos: {filteredOrders.length}</p>

            <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-black mb-4">Lista de Pedidos</h2>

                <table className="min-w-full table-auto text-left text-black">
                    <thead>
                    <tr>
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Cliente</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                            <td className="px-4 py-2">{order.id}</td>
                            <td className="px-4 py-2">{order.customer_name}</td>
                            <td className="px-4 py-2">{order.status}</td>
                            <td className="px-4 py-2">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleApprove(order.id)}
                                        className={`px-4 py-2 text-white rounded-lg ${
                                            order.status === 'approved'
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                        disabled={order.status === 'approved'}
                                    >
                                        Aprovar
                                    </button>
                                    <button
                                        onClick={() => handleReject(order.id)}
                                        className={`px-4 py-2 text-white rounded-lg ${
                                            order.status === 'rejected'
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                        disabled={order.status === 'rejected'}
                                    >
                                        Rejeitar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* Exibir mensagem de sucesso ou erro */}
                {message && <p className="text-green-500 mt-4">{message}</p>}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {/* Contador de pedidos no final */}
            <p className="mt-4 text-black">Total de Pedidos: {filteredOrders.length}</p>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

// Interface para tipagem dos dados da ordem
interface Order {
    customer_name: string;
    customer_phone: string;
    status: string;
    order_date: string;
    external_id: string;
    numbers_count: number;
}

interface AggregatedOrder {
    customer_name: string;
    total_numbers_count: number;
}

export default function RankingPage() {
    const [orders, setOrders] = useState<AggregatedOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get<Order[]>('https://raffle.popingressos.com.br/orders', {
                    headers: {
                        accept: 'application/json',
                    },
                });

                // Agrupa ordens com o mesmo nome de cliente e soma os números comprados
                const aggregatedOrders = response.data.reduce((acc: AggregatedOrder[], order: Order) => {
                    const existingOrder = acc.find((item) => item.customer_name === order.customer_name);

                    if (existingOrder) {
                        existingOrder.total_numbers_count += order.numbers_count;
                    } else {
                        acc.push({ customer_name: order.customer_name, total_numbers_count: order.numbers_count });
                    }

                    return acc;
                }, []);

                // Ordena os pedidos agregados com base no total_numbers_count em ordem decrescente
                const sortedOrders = aggregatedOrders.sort((a, b) => b.total_numbers_count - a.total_numbers_count);
                setOrders(sortedOrders);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch orders', err);
                setError('Failed to load orders');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="text-center">Carregando...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="container mx-auto px-4">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Ranking de Compradores</h1>
                    <table className="min-w-full table-auto">
                        <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-blue-800">Posição</th>
                            <th className="px-4 py-2 text-left text-blue-800">Cliente</th>
                            <th className="px-4 py-2 text-left text-blue-800">Números Comprados</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-4 py-2 text-black">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                </td>
                                <td className="px-4 py-2 text-black">{order.customer_name}</td>
                                <td className="px-4 py-2 text-black">{order.total_numbers_count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

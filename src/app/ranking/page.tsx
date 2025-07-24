"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from "next/link";

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
                const response = await axios.get<Order[]>('https://raffle.glima.dev/orders', {
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
                setError('Falha ao carregar o ranking');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getRankIcon = (position: number) => {
        switch (position) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `${position + 1}°`;
        }
    };

    const getRankColor = (position: number) => {
        switch (position) {
            case 0: return 'from-yellow-400 to-yellow-600 text-white';
            case 1: return 'from-gray-300 to-gray-500 text-white';
            case 2: return 'from-orange-400 to-orange-600 text-white';
            default: return 'from-blue-50 to-indigo-50 text-gray-800';
        }
    };

    const getCardShadow = (position: number) => {
        switch (position) {
            case 0: return 'shadow-2xl shadow-yellow-200';
            case 1: return 'shadow-2xl shadow-gray-200';
            case 2: return 'shadow-2xl shadow-orange-200';
            default: return 'shadow-lg';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Carregando ranking...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-6xl mb-4">😔</div>
                    <p className="text-red-600 text-lg font-semibold">{error}</p>
                    <Link href="/" className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                        Voltar à Rifa
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🏆</div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Ranking de Compradores
                        </h1>
                        <p className="text-xl text-blue-100 mb-6">
                            Veja quem está na liderança!
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300"
                        >
                            <span className="mr-2">🎟️</span>
                            Voltar à Rifa
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {orders.length === 0 ? (
                    <div className="text-center bg-white rounded-3xl shadow-xl p-12">
                        <div className="text-8xl mb-6">🎭</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Nenhuma compra ainda!</h2>
                        <p className="text-gray-600 mb-8">Seja o primeiro a aparecer no ranking!</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
                        >
                            🎟️ Comprar Números
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Top 3 Podium */}
                        {orders.length >= 3 && (
                            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">🏆 Pódio dos Campeões</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                    {/* 2º Lugar */}
                                    {orders[1] && (
                                        <div className="order-3 md:order-1 text-center">
                                            <div className="bg-gradient-to-br from-gray-300 to-gray-500 text-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-300 h-32 flex flex-col justify-center mb-4">
                                                <div className="text-4xl mb-2">🥈</div>
                                                <div className="text-xl font-bold">{orders[1].total_numbers_count}</div>
                                                <div className="text-sm opacity-90">números</div>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-800 truncate">{orders[1].customer_name}</h3>
                                            <p className="text-gray-600">2º Lugar</p>
                                        </div>
                                    )}

                                    {/* 1º Lugar */}
                                    <div className="order-1 md:order-2 text-center">
                                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-2xl p-8 shadow-2xl shadow-yellow-200 transform hover:scale-105 transition-transform duration-300 h-40 flex flex-col justify-center mb-4">
                                            <div className="text-6xl mb-2">👑</div>
                                            <div className="text-2xl font-bold">{orders[0].total_numbers_count}</div>
                                            <div className="text-sm opacity-90">números</div>
                                        </div>
                                        <h3 className="font-bold text-xl text-gray-800 truncate">{orders[0].customer_name}</h3>
                                        <p className="text-yellow-600 font-semibold">🥇 Campeão Atual</p>
                                    </div>

                                    {/* 3º Lugar */}
                                    {orders[2] && (
                                        <div className="order-2 md:order-3 text-center">
                                            <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-300 h-32 flex flex-col justify-center mb-4">
                                                <div className="text-4xl mb-2">🥉</div>
                                                <div className="text-xl font-bold">{orders[2].total_numbers_count}</div>
                                                <div className="text-sm opacity-90">números</div>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-800 truncate">{orders[2].customer_name}</h3>
                                            <p className="text-gray-600">3º Lugar</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Lista Completa */}
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                                <h2 className="text-2xl font-bold text-center">📊 Ranking Completo</h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {orders.map((order, index) => (
                                        <div
                                            key={index}
                                            className={`
                                                rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-102 border-2
                                                ${index < 3 ? 'border-transparent' : 'border-gray-100 hover:border-indigo-200'}
                                                ${getCardShadow(index)}
                                            `}
                                        >
                                            <div className={`bg-gradient-to-r ${getRankColor(index)} rounded-xl p-4`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-3xl font-bold min-w-[60px] text-center">
                                                            {getRankIcon(index)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg truncate max-w-[200px] sm:max-w-none">
                                                                {order.customer_name}
                                                            </h3>
                                                            <p className={`text-sm ${index < 3 ? 'text-white/80' : 'text-gray-600'}`}>
                                                                {index === 0 ? '👑 Líder Atual' :
                                                                    index === 1 ? '🥈 Vice-líder' :
                                                                        index === 2 ? '🥉 Terceiro Colocado' :
                                                                            `${index + 1}ª posição`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold">
                                                            {order.total_numbers_count}
                                                        </div>
                                                        <div className={`text-sm ${index < 3 ? 'text-white/80' : 'text-gray-600'}`}>
                                                            números
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Barra de progresso relativa ao líder */}
                                            <div className="mt-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                                        style={{
                                                            width: `${(order.total_numbers_count / orders[0].total_numbers_count) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 text-right">
                                                    {Math.round((order.total_numbers_count / orders[0].total_numbers_count) * 100)}% do líder
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                                <div className="text-4xl mb-4">👥</div>
                                <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
                                <div className="text-gray-600">Participantes</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                                <div className="text-4xl mb-4">🎟️</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {orders.reduce((sum, order) => sum + order.total_numbers_count, 0)}
                                </div>
                                <div className="text-gray-600">Total de Números</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                                <div className="text-4xl mb-4">📊</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + order.total_numbers_count, 0) / orders.length) : 0}
                                </div>
                                <div className="text-gray-600">Média por Pessoa</div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="text-center mt-8">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
                                <div className="text-5xl mb-4">🎯</div>
                                <h2 className="text-2xl font-bold mb-4">Quer subir no ranking?</h2>
                                <p className="text-lg text-indigo-100 mb-6">
                                    Compre mais números e dispute a liderança!
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                                >
                                    🎟️ Comprar Mais Números
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes scale-102 {
                    to { transform: scale(1.02); }
                }
                .hover\\:scale-102:hover {
                    animation: scale-102 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

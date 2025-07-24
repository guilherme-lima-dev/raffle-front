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
            case 0: return '👑';
            case 1: return '💎';
            case 2: return '🌹';
            default: return `${position + 1}°`;
        }
    };

    const getRankColor = (position: number) => {
        switch (position) {
            case 0: return 'from-yellow-400 via-amber-400 to-yellow-600 text-white';
            case 1: return 'from-gray-300 via-slate-400 to-gray-500 text-white';
            case 2: return 'from-rose-400 via-pink-400 to-rose-600 text-white';
            default: return 'from-blue-50 to-rose-50 text-slate-700';
        }
    };

    const getCardShadow = (position: number) => {
        switch (position) {
            case 0: return 'shadow-2xl shadow-yellow-200';
            case 1: return 'shadow-2xl shadow-gray-200';
            case 2: return 'shadow-2xl shadow-rose-200';
            default: return 'shadow-lg';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-400 mx-auto mb-4"></div>
                    <p className="text-slate-600 text-lg font-light">Carregando ranking dos colaboradores...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-rose-100">
                    <div className="text-6xl mb-4">💔</div>
                    <p className="text-rose-600 text-lg font-medium">{error}</p>
                    <Link href="/" className="mt-4 inline-block px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors">
                        Voltar à Rifa
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-blue-50">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-rose-200 opacity-30 text-4xl float-animation">🌸</div>
                <div className="absolute top-20 right-20 text-blue-200 opacity-30 text-3xl float-animation" style={{ animationDelay: '2s' }}>💙</div>
                <div className="absolute bottom-32 left-16 text-pink-200 opacity-30 text-5xl float-animation" style={{ animationDelay: '4s' }}>🌿</div>
                <div className="absolute bottom-20 right-32 text-rose-200 opacity-30 text-4xl float-animation" style={{ animationDelay: '1s' }}>🌹</div>
            </div>

            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-600 via-blue-700 to-slate-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Ornamental divider */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                            <div className="mx-6 text-rose-200 text-2xl">👑</div>
                            <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                        </div>

                        <div className="text-6xl mb-6 float-animation">👑</div>
                        <h1 className="text-4xl md:text-5xl font-light mb-4 font-serif">
                            Ranking dos Colaboradores
                        </h1>
                        <p className="text-xl text-blue-100 mb-2 font-light">
                            Nossos queridos amigos e familiares
                        </p>
                        <p className="text-lg text-rose-200 mb-8">
                            💕 Obrigada por tornarem nosso sonho possível! 💕
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/"
                                className="inline-flex items-center px-6 py-3 bg-white/15 backdrop-blur-sm rounded-full text-white hover:bg-white/25 transition-all duration-300 border border-white/20"
                            >
                                <span className="mr-2">🎟️</span>
                                Voltar à Rifa
                            </Link>
                            <a
                                href="https://www.casamentolarigui.com.br/#/presentes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-rose-500/20 backdrop-blur-sm rounded-full text-white hover:bg-rose-500/30 transition-all duration-300 border border-rose-300/30"
                            >
                                <span className="mr-2">🎁</span>
                                Lista de Presentes
                            </a>
                        </div>

                        {/* Ornamental divider */}
                        <div className="flex items-center justify-center mt-8">
                            <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                            <div className="mx-6 text-rose-200 text-2xl">💙</div>
                            <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {orders.length === 0 ? (
                    <div className="text-center bg-white rounded-3xl shadow-xl p-12 border border-rose-100">
                        <div className="text-8xl mb-6">💒</div>
                        <h2 className="text-2xl font-light text-slate-700 mb-4 font-serif">Ainda não temos colaboradores!</h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">Seja o primeiro a nos ajudar a realizar o sonho do nosso casamento!</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-2xl font-medium hover:from-rose-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            💕 Participar da Rifa
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Top 3 Podium */}
                        {orders.length >= 1 && (
                            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-rose-100">
                                <h2 className="text-2xl font-light text-center text-slate-700 mb-8 font-serif">💝 Hall da Fama dos Colaboradores</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                    {/* 2º Lugar */}
                                    {orders[1] && (
                                        <div className="order-3 md:order-1 text-center">
                                            <div className="bg-gradient-to-br from-gray-300 via-slate-400 to-gray-500 text-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-500 h-32 flex flex-col justify-center mb-4 border-4 border-gray-200">
                                                <div className="text-4xl mb-2">💎</div>
                                                <div className="text-xl font-light">{orders[1].total_numbers_count}</div>
                                                <div className="text-sm opacity-90">números</div>
                                            </div>
                                            <h3 className="font-medium text-lg text-slate-700 truncate">{orders[1].customer_name}</h3>
                                            <p className="text-slate-500 font-light">Colaborador Prata</p>
                                        </div>
                                    )}

                                    {/* 1º Lugar */}
                                    <div className="order-1 md:order-2 text-center">
                                        <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-600 text-white rounded-2xl p-8 shadow-2xl shadow-yellow-200 transform hover:scale-105 transition-transform duration-500 h-40 flex flex-col justify-center mb-4 border-4 border-yellow-300 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                            <div className="text-6xl mb-2 relative z-10">👑</div>
                                            <div className="text-2xl font-light relative z-10">{orders[0].total_numbers_count}</div>
                                            <div className="text-sm opacity-90 relative z-10">números</div>
                                        </div>
                                        <h3 className="font-medium text-xl text-slate-700 truncate">{orders[0].customer_name}</h3>
                                        <p className="text-yellow-600 font-medium">👑 Colaborador Ouro</p>
                                    </div>

                                    {/* 3º Lugar */}
                                    {orders[2] && (
                                        <div className="order-2 md:order-3 text-center">
                                            <div className="bg-gradient-to-br from-rose-400 via-pink-400 to-rose-600 text-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-500 h-32 flex flex-col justify-center mb-4 border-4 border-rose-200">
                                                <div className="text-4xl mb-2">🌹</div>
                                                <div className="text-xl font-light">{orders[2].total_numbers_count}</div>
                                                <div className="text-sm opacity-90">números</div>
                                            </div>
                                            <h3 className="font-medium text-lg text-slate-700 truncate">{orders[2].customer_name}</h3>
                                            <p className="text-rose-500 font-light">Colaborador Rosa</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Lista Completa */}
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100">
                            <div className="bg-gradient-to-r from-slate-600 via-blue-700 to-slate-800 text-white p-6">
                                <h2 className="text-2xl font-light text-center font-serif">📋 Todos os Nossos Colaboradores</h2>
                                <p className="text-center text-blue-100 mt-2 font-light">Com muito carinho e gratidão 💕</p>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {orders.map((order, index) => (
                                        <div
                                            key={index}
                                            className={`
                                                rounded-2xl p-6 transition-all duration-500 hover:transform hover:scale-102 border-2
                                                ${index < 3 ? 'border-transparent' : 'border-rose-100 hover:border-rose-200'}
                                                ${getCardShadow(index)}
                                            `}
                                        >
                                            <div className={`bg-gradient-to-r ${getRankColor(index)} rounded-xl p-4`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-3xl font-light min-w-[60px] text-center">
                                                            {getRankIcon(index)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-lg truncate max-w-[200px] sm:max-w-none">
                                                                {order.customer_name}
                                                            </h3>
                                                            <p className={`text-sm font-light ${index < 3 ? 'text-white/80' : 'text-slate-600'}`}>
                                                                {index === 0 ? '💝 Nosso maior colaborador' :
                                                                    index === 1 ? '💎 Colaborador especial' :
                                                                        index === 2 ? '🌹 Colaborador querido' :
                                                                            `${index + 1}ª posição no ranking`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-light">
                                                            {order.total_numbers_count}
                                                        </div>
                                                        <div className={`text-sm font-light ${index < 3 ? 'text-white/80' : 'text-slate-600'}`}>
                                                            números
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Barra de progresso relativa ao líder */}
                                            <div className="mt-4">
                                                <div className="w-full bg-rose-100 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-rose-400 to-pink-400 h-2 rounded-full transition-all duration-1000"
                                                        style={{
                                                            width: `${(order.total_numbers_count / orders[0].total_numbers_count) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 text-right font-light">
                                                    {Math.round((order.total_numbers_count / orders[0].total_numbers_count) * 100)}% do maior colaborador
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas Românticas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-rose-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 text-6xl text-rose-50 opacity-30">👥</div>
                                <div className="relative z-10">
                                    <div className="text-4xl mb-4">💕</div>
                                    <div className="text-2xl font-light text-slate-700">{orders.length}</div>
                                    <div className="text-slate-600 font-light">Colaboradores</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-rose-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 text-6xl text-blue-50 opacity-30">🎟️</div>
                                <div className="relative z-10">
                                    <div className="text-4xl mb-4">✨</div>
                                    <div className="text-2xl font-light text-slate-700">
                                        {orders.reduce((sum, order) => sum + order.total_numbers_count, 0)}
                                    </div>
                                    <div className="text-slate-600 font-light">Números Adquiridos</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-rose-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 text-6xl text-pink-50 opacity-30">📊</div>
                                <div className="relative z-10">
                                    <div className="text-4xl mb-4">💝</div>
                                    <div className="text-2xl font-light text-slate-700">
                                        {orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + order.total_numbers_count, 0) / orders.length) : 0}
                                    </div>
                                    <div className="text-slate-600 font-light">Média por Pessoa</div>
                                </div>
                            </div>
                        </div>

                        {/* Mensagem de Gratidão */}
                        <div className="text-center mt-8">
                            <div className="bg-gradient-to-br from-slate-600 via-blue-700 to-slate-800 rounded-3xl shadow-2xl p-8 text-white border border-slate-200 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                <div className="relative z-10">
                                    <div className="text-5xl mb-4 float-animation">💕</div>
                                    <h2 className="text-2xl font-light mb-4 font-serif">Nosso Coração Transborda de Gratidão</h2>
                                    <p className="text-lg text-blue-100 mb-6 font-light leading-relaxed">
                                        Cada número adquirido é uma bênção em nossas vidas.<br />
                                        Vocês estão tornando nosso sonho de casamento uma realidade! 🙏✨
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Link
                                            href="/"
                                            className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border border-white/30"
                                        >
                                            💕 Participar Também
                                        </Link>
                                        <a
                                            href="https://www.casamentolarigui.com.br/#/presentes"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-8 py-4 bg-rose-500/30 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-rose-500/40 transition-all duration-300 transform hover:scale-105 border border-rose-300/50"
                                        >
                                            💝 Ver Lista de Presentes
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                
                .float-animation {
                    animation: float 6s ease-in-out infinite;
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                }
                
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

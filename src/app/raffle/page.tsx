"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from "next/link";

// Interface para tipagem dos dados da rifa
interface RaffleNumber {
    id: number;
    number: number;
    status: string;
    external_id: string;
}

interface Raffle {
    name: string;
    description: string;
    price: string;
    total_numbers: number;
    status: string;
    external_id: string;
    numbers: RaffleNumber[];
}

export default function RafflePage() {
    const [raffle, setRaffle] = useState<Raffle | null>(null);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [customerName, setCustomerName] = useState<string>('');
    const [customerPhone, setCustomerPhone] = useState<string>('');
    const [pixMessage, setPixMessage] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [randomSelectionCount, setRandomSelectionCount] = useState<number>(0);
    const [availableSlots, setAvailableSlots] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchRaffle = async () => {
            try {
                const response = await axios.get<Raffle>('https://raffle.glima.dev/raffles/821b2585-68c3-11f0-9bdd-028d44224fc7');
                setRaffle(response.data);
                setLoading(false);

                const available = response.data.numbers.filter(num => num.status === 'available').length;
                setAvailableSlots(available);

            } catch (err) {
                setError('Falha ao carregar os dados da rifa');
                setLoading(false);
            }
        };

        fetchRaffle();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSelectNumber = (number: number) => {
        if (selectedNumbers.includes(number)) {
            setSelectedNumbers(selectedNumbers.filter((num) => num !== number));
        } else {
            setSelectedNumbers([...selectedNumbers, number]);
        }
    };

    const handleRandomSelection = () => {
        if (!raffle) return;
        const availableNumbers = raffle.numbers.filter(num => num.status === 'available');
        const selected = [];

        while (selected.length < randomSelectionCount && availableNumbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            const selectedNumber = availableNumbers.splice(randomIndex, 1)[0];
            selected.push(selectedNumber.number);
        }

        setSelectedNumbers(selected);
    };

    const handleConfirmOrder = async () => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('https://raffle.glima.dev/orders', {
                customer_name: customerName,
                customer_phone: customerPhone || 'NULL',
                numbers: selectedNumbers,
                raffle_eid: raffle?.external_id,
            });

            setOrderId(response.data.id);
            setShowModal(false);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Erro ao criar a ordem', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendWhatsAppMessage = (orderId: string) => {
        const whatsappNumber = '5561993248349';
        const message = `Oii Gui e Lari, gostaria de comprar os números: ${selectedNumbers.join(', ')} da rifa ${raffle?.name}. Meu número de pedido é ${orderId}.`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        if (orderId) {
            sendWhatsAppMessage(orderId);
        }
    };

    const handleCopyPix = () => {
        const pixKey = '61993248349';
        navigator.clipboard.writeText(pixKey).then(() => {
            setPixMessage('Chave PIX copiada para a área de transferência!');
            setTimeout(() => setPixMessage(null), 3000);
        });
    };

    const calculateProgress = () => {
        if (!raffle) return 0;
        const soldNumbers = raffle.numbers.filter(num => num.status !== 'available').length;
        return (soldNumbers / raffle.total_numbers) * 100;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Carregando rifa...</p>
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white">
                            {raffle?.name}
                        </h1>
                        <p className="text-xl md:text-2xl mb-6 text-indigo-100">{raffle?.description}</p>

                        <div className="flex flex-wrap justify-center gap-6 mb-8">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[200px]">
                                <div className="text-3xl font-bold text-yellow-300">R$ {raffle?.price}</div>
                                <div className="text-sm text-indigo-200">por número</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[200px]">
                                <div className="text-3xl font-bold text-green-300">R$ 500</div>
                                <div className="text-sm text-indigo-200">premiação</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[200px]">
                                <div className="text-3xl font-bold text-blue-300">{availableSlots}</div>
                                <div className="text-sm text-indigo-200">números disponíveis</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="max-w-md mx-auto">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Progresso da rifa</span>
                                <span>{Math.round(calculateProgress())}%</span>
                            </div>
                            <div className="w-full bg-white/30 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${calculateProgress()}%` }}
                                ></div>
                            </div>
                        </div>

                        <Link href="/ranking" className="inline-flex items-center mt-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300">
                            <span className="mr-2">🏆</span>
                            Ver Ranking de Compradores
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* PIX Section */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                            <span className="mr-3 text-3xl">🔑</span>
                            Chave PIX
                        </h2>
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl cursor-pointer hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 inline-block"
                            onClick={handleCopyPix}
                        >
                            <div className="text-xl font-bold">61993248349</div>
                            <div className="text-sm opacity-90">Clique para copiar</div>
                        </div>
                        {pixMessage && (
                            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-xl border border-green-200 animate-fade-in">
                                ✅ {pixMessage}
                            </div>
                        )}
                    </div>
                </div>

                {/* Random Selection */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-3 text-3xl">🎲</span>
                        Seleção Aleatória
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                            type="number"
                            placeholder="Quantos números?"
                            value={randomSelectionCount || ''}
                            onChange={(e) => setRandomSelectionCount(Number(e.target.value))}
                            className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-indigo-500 focus:outline-none transition-colors"
                            max={availableSlots}
                        />
                        <button
                            onClick={handleRandomSelection}
                            disabled={randomSelectionCount <= 0 || randomSelectionCount > availableSlots}
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                        >
                            🎯 Sortear Números
                        </button>
                    </div>
                </div>

                {/* Selected Numbers */}
                {selectedNumbers.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl shadow-xl p-8 mb-8 border border-green-200">
                        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                            <span className="mr-3 text-2xl">✅</span>
                            Números Selecionados ({selectedNumbers.length})
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {selectedNumbers.sort((a, b) => a - b).map((num) => (
                                <span key={num} className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                    {num}
                                </span>
                            ))}
                        </div>
                        <div className="mt-4 text-green-700 font-semibold">
                            💰 Total: R$ {(selectedNumbers.length * parseFloat(raffle?.price || '0')).toFixed(2)}
                        </div>
                    </div>
                )}

                {/* Numbers Grid */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-32 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-3 text-3xl">🎟️</span>
                        Escolha seus números
                    </h2>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                        {raffle?.numbers.map((num) => (
                            <div
                                key={num.external_id}
                                className={`
                                    aspect-square flex items-center justify-center rounded-2xl cursor-pointer font-bold text-sm transition-all duration-300 transform hover:scale-110 shadow-lg
                                    ${num.status === 'available'
                                    ? selectedNumbers.includes(num.number)
                                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-300 ring-opacity-50 scale-110'
                                        : 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600'
                                    : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                                }
                                `}
                                onClick={() => num.status === 'available' && handleSelectNumber(num.number)}
                            >
                                {num.number}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Buy Button */}
                <div className={`${isScrolled ? 'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50' : 'flex justify-center'}`}>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={selectedNumbers.length === 0 || isSubmitting}
                        className={`
                            px-12 py-6 rounded-full text-white font-bold text-xl transition-all duration-300 shadow-2xl
                            ${selectedNumbers.length === 0 || isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transform hover:scale-105'
                        }
                            ${isScrolled ? 'animate-bounce' : ''}
                        `}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4"></circle>
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Processando...
                            </div>
                        ) : (
                            <>
                                🛒 Comprar ({selectedNumbers.length} números)
                            </>
                        )}
                    </button>
                </div>

                {/* Modal de Confirmação */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-8">
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4">🎟️</div>
                                    <h2 className="text-2xl font-bold text-gray-800">Confirme seu Pedido</h2>
                                </div>

                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
                                    <div className="text-center">
                                        <p className="text-gray-600 mb-2">Chave PIX</p>
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl cursor-pointer hover:from-green-600 hover:to-emerald-600 transition-all duration-300 inline-block"
                                            onClick={handleCopyPix}
                                        >
                                            <span className="font-bold">61993248349</span>
                                        </div>
                                        {pixMessage && (
                                            <p className="text-green-600 mt-2 text-sm">✅ {pixMessage}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                                    <p className="text-gray-700 font-semibold mb-2">Números selecionados:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedNumbers.sort((a, b) => a - b).map((num) => (
                                            <span key={num} className="bg-blue-500 text-white px-3 py-1 rounded-full font-bold">
                                                {num}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-green-600 font-bold mt-3 text-lg">
                                        💰 Total: R$ {(selectedNumbers.length * parseFloat(raffle?.price || '0')).toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <input
                                        type="text"
                                        placeholder="Seu nome completo"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Telefone (opcional)"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmOrder}
                                        disabled={isSubmitting || !customerName.trim()}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                                Confirmando...
                                            </div>
                                        ) : (
                                            '✅ Confirmar Pedido'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Sucesso */}
                {showSuccessModal && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={handleCloseSuccessModal}
                    >
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full text-center p-8">
                            <div className="animate-bounce text-8xl mb-6">🎉</div>
                            <h2 className="text-3xl font-bold text-green-600 mb-4">Pedido Confirmado!</h2>
                            <p className="text-gray-700 font-semibold text-lg mb-2">Seu pedido foi registrado com sucesso!</p>
                            <p className="text-gray-600 mb-8">Agora envie o comprovante via WhatsApp para confirmar sua compra.</p>
                            <button
                                onClick={handleCloseSuccessModal}
                                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
                            >
                                📱 Enviar Comprovante
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

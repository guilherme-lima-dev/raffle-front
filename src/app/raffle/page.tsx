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
        const message = `Olá Larissa e Guilherme! 💕 Gostaria de comprar os números: ${selectedNumbers.join(', ')} da rifa do casamento de vocês. Meu número de pedido é ${orderId}. Que Deus abençoe essa união! 🙏✨`;
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
            setPixMessage('Chave PIX copiada com sucesso! 💕');
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
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-400 mx-auto mb-4"></div>
                    <p className="text-slate-600 text-lg font-light">Carregando nossa rifa especial...</p>
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-blue-50">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-rose-200 opacity-30 text-6xl">🌸</div>
                <div className="absolute top-20 right-20 text-blue-200 opacity-30 text-4xl">💙</div>
                <div className="absolute bottom-32 left-16 text-pink-200 opacity-30 text-5xl">🌿</div>
                <div className="absolute bottom-20 right-32 text-rose-200 opacity-30 text-6xl">🌹</div>
            </div>

            {/* Header Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-600 via-blue-700 to-slate-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Ornamental divider */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                            <div className="mx-6 text-rose-200 text-2xl">💕</div>
                            <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-light mb-4 tracking-wide">
                            <span className="block text-rose-200 text-2xl md:text-3xl font-light mb-2">Rifa do Casamento</span>
                            <span className="font-serif">Larissa & Guilherme</span>
                        </h1>

                        <div className="text-lg md:text-xl mb-8 text-blue-100 font-light leading-relaxed">
                            <p className="mb-2">Ajudem os noivos a realizar o sonho do casamento!</p>
                            <p className="text-rose-200">💐 13 • 09 • 2025 💐</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-light text-rose-200 mb-1">R$ {raffle?.price}</div>
                                <div className="text-sm text-blue-200">por número</div>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-light text-rose-200 mb-1">R$ 500</div>
                                <div className="text-sm text-blue-200">premiação</div>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-light text-rose-200 mb-1">{availableSlots}</div>
                                <div className="text-sm text-blue-200">disponíveis</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="max-w-md mx-auto mb-8">
                            <div className="flex justify-between text-sm mb-3 text-blue-200">
                                <span>Progresso da rifa</span>
                                <span>{Math.round(calculateProgress())}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-rose-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${calculateProgress()}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/ranking" className="inline-flex items-center px-6 py-3 bg-white/15 backdrop-blur-sm rounded-full text-white hover:bg-white/25 transition-all duration-300 border border-white/20">
                                <span className="mr-2">👑</span>
                                Ver Ranking
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

            <div className="container mx-auto px-4 py-12">
                {/* Wedding Gift List Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-rose-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 text-8xl text-rose-50 opacity-50">🎁</div>
                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-light text-slate-700 mb-4 font-serif">Lista de Presentes</h2>
                            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
                                Além da rifa, vocês também podem nos presentear através da nossa lista oficial.
                                Cada presente é uma bênção especial para iniciarmos nossa nova vida juntos! 💕
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <a
                                href="https://www.casamentolarigui.com.br/#/presentes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-2xl font-medium hover:from-rose-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                <span className="mr-3 text-2xl">🎁</span>
                                Acessar Lista de Presentes
                                <span className="ml-3 text-xl">💝</span>
                            </a>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-500 italic">
                                Site oficial: www.casamentolarigui.com.br
                            </p>
                        </div>
                    </div>
                </div>

                {/* PIX Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-rose-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 text-8xl text-green-50 opacity-50">💳</div>
                    <div className="relative z-10 text-center">
                        <h2 className="text-2xl font-light text-slate-700 mb-6 font-serif flex items-center justify-center">
                            <span className="mr-3 text-green-500">🔑</span>
                            Chave PIX para a Rifa
                        </h2>
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-2xl cursor-pointer hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 inline-block shadow-lg"
                            onClick={handleCopyPix}
                        >
                            <div className="text-2xl font-light mb-1">61993248349</div>
                            <div className="text-sm opacity-90">Toque para copiar</div>
                        </div>
                        {pixMessage && (
                            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fade-in">
                                ✅ {pixMessage}
                            </div>
                        )}
                    </div>
                </div>

                {/* Random Selection */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-rose-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 text-8xl text-purple-50 opacity-50">🎲</div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-light text-slate-700 mb-6 font-serif flex items-center">
                            <span className="mr-3 text-purple-500">🎲</span>
                            Seleção da Sorte
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input
                                type="number"
                                placeholder="Quantos números da sorte?"
                                value={randomSelectionCount || ''}
                                onChange={(e) => setRandomSelectionCount(Number(e.target.value))}
                                className="flex-1 px-6 py-4 border-2 border-rose-200 rounded-2xl text-slate-700 focus:border-rose-400 focus:outline-none transition-colors placeholder-slate-400"
                                max={availableSlots}
                            />
                            <button
                                onClick={handleRandomSelection}
                                disabled={randomSelectionCount <= 0 || randomSelectionCount > availableSlots}
                                className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl font-medium hover:from-purple-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 whitespace-nowrap shadow-lg"
                            >
                                ✨ Sortear Números
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selected Numbers */}
                {selectedNumbers.length > 0 && (
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl shadow-xl p-8 mb-8 border border-rose-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 text-8xl text-rose-100 opacity-50">💕</div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-light text-rose-700 mb-6 font-serif flex items-center">
                                <span className="mr-3 text-2xl">✨</span>
                                Seus Números da Sorte ({selectedNumbers.length})
                            </h3>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {selectedNumbers.sort((a, b) => a - b).map((num) => (
                                    <span key={num} className="bg-gradient-to-r from-rose-400 to-pink-400 text-white px-4 py-2 rounded-full font-medium text-lg shadow-lg">
                                        {num}
                                    </span>
                                ))}
                            </div>
                            <div className="text-rose-600 font-medium text-lg">
                                💰 Total: R$ {(selectedNumbers.length * parseFloat(raffle?.price || '0')).toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Numbers Grid */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-32 border border-rose-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 text-8xl text-blue-50 opacity-50">🎟️</div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-light text-slate-700 mb-6 font-serif flex items-center">
                            <span className="mr-3 text-blue-500">🎟️</span>
                            Escolha seus Números da Sorte
                        </h2>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                            {raffle?.numbers.map((num) => (
                                <div
                                    key={num.external_id}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-2xl cursor-pointer font-medium text-sm transition-all duration-300 transform hover:scale-110 shadow-md
                                        ${num.status === 'available'
                                        ? selectedNumbers.includes(num.number)
                                            ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white ring-4 ring-rose-200 ring-opacity-50 scale-110 shadow-lg'
                                            : 'bg-gradient-to-br from-blue-400 to-slate-500 text-white hover:from-blue-500 hover:to-slate-600'
                                        : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                    }
                                    `}
                                    onClick={() => num.status === 'available' && handleSelectNumber(num.number)}
                                >
                                    {num.number}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Floating Buy Button */}
                <div className={`${isScrolled ? 'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50' : 'flex justify-center'}`}>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={selectedNumbers.length === 0 || isSubmitting}
                        className={`
                            px-12 py-6 rounded-full text-white font-medium text-xl transition-all duration-300 shadow-2xl
                            ${selectedNumbers.length === 0 || isSubmitting
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transform hover:scale-105'
                        }
                            ${isScrolled ? 'animate-pulse' : ''}
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
                                💕 Comprar ({selectedNumbers.length} números)
                            </>
                        )}
                    </button>
                </div>

                {/* Modal de Confirmação */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-rose-100">
                            <div className="p-8">
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4">💕</div>
                                    <h2 className="text-2xl font-light text-slate-700 font-serif">Confirme seu Pedido</h2>
                                    <p className="text-slate-500 mt-2">Para o casamento da Larissa & Guilherme</p>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
                                    <div className="text-center">
                                        <p className="text-slate-600 mb-3 font-medium">Chave PIX</p>
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl cursor-pointer hover:from-green-600 hover:to-emerald-600 transition-all duration-300 inline-block shadow-lg"
                                            onClick={handleCopyPix}
                                        >
                                            <span className="font-medium">61993248349</span>
                                        </div>
                                        {pixMessage && (
                                            <p className="text-green-600 mt-3 text-sm">✅ {pixMessage}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 mb-6 border border-rose-200">
                                    <p className="text-slate-700 font-medium mb-3">Números selecionados:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedNumbers.sort((a, b) => a - b).map((num) => (
                                            <span key={num} className="bg-gradient-to-r from-rose-400 to-pink-400 text-white px-3 py-1 rounded-full font-medium">
                                                {num}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-rose-600 font-medium mt-4 text-lg">
                                        💰 Total: R$ {(selectedNumbers.length * parseFloat(raffle?.price || '0')).toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <input
                                        type="text"
                                        placeholder="Seu nome completo"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-6 py-4 border-2 border-rose-200 rounded-2xl text-slate-700 focus:border-rose-400 focus:outline-none transition-colors placeholder-slate-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Telefone (opcional)"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full px-6 py-4 border-2 border-rose-200 rounded-2xl text-slate-700 focus:border-rose-400 focus:outline-none transition-colors placeholder-slate-400"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmOrder}
                                        disabled={isSubmitting || !customerName.trim()}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-medium hover:from-rose-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
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
                                            '💕 Confirmar Pedido'
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
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full text-center p-8 border border-rose-100 relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute -top-4 -left-4 text-6xl text-rose-100 opacity-40 float-animation">🌸</div>
                                <div className="absolute -top-2 -right-2 text-4xl text-pink-100 opacity-40 float-animation" style={{ animationDelay: '1s' }}>💕</div>
                                <div className="absolute -bottom-4 -left-2 text-5xl text-blue-100 opacity-40 float-animation" style={{ animationDelay: '2s' }}>🌿</div>
                                <div className="absolute -bottom-2 -right-4 text-4xl text-rose-100 opacity-40 float-animation" style={{ animationDelay: '3s' }}>✨</div>
                            </div>

                            <div className="relative z-10">
                                {/* Animated heart with pulse effect */}
                                <div className="relative mb-6">
                                    <div className="animate-bounce text-8xl mb-2">💕</div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-rose-200 rounded-full opacity-20 animate-ping"></div>
                                    </div>
                                </div>

                                {/* Title with gradient text */}
                                <h2 className="text-3xl font-light text-rose-600 mb-4 font-serif bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    Pedido Confirmado!
                                </h2>

                                {/* Decorative divider */}
                                <div className="flex items-center justify-center mb-6">
                                    <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                                    <div className="mx-4 text-rose-300 text-xl">💝</div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                                </div>

                                {/* Success message */}
                                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 mb-6 border border-rose-200">
                                    <p className="text-slate-700 font-medium text-lg mb-3">
                                        🙏 Nosso coração transborda de gratidão!
                                    </p>
                                    <p className="text-slate-600 text-base leading-relaxed">
                                        Obrigada por participar da nossa rifa especial e nos ajudar a realizar o sonho do nosso casamento!
                                        Agora envie o comprovante via WhatsApp para confirmarmos sua participação.
                                    </p>
                                </div>

                                {/* Blessing message */}
                                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4 mb-8 border border-blue-200">
                                    <p className="text-slate-600 italic font-light">
                                        &quot;Que Deus abençoe você e sua família! 🙏✨&ldquo;
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2">
                                        - Larissa & Guilherme
                                    </p>
                                </div>

                                {/* WhatsApp button with enhanced styling */}
                                <button
                                    onClick={handleCloseSuccessModal}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    <div className="relative flex items-center justify-center">
                                        <span className="mr-3 text-2xl">📱</span>
                                        Enviar Comprovante via WhatsApp
                                        <span className="ml-3 text-xl">💚</span>
                                    </div>
                                </button>

                                {/* Additional info */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        📋 Seu pedido foi registrado com sucesso! Após o envio do comprovante,
                                        seus números estarão oficialmente reservados.
                                    </p>
                                </div>

                                {/* Close hint */}
                                <div className="mt-4">
                                    <p className="text-xs text-slate-400 italic">
                                        Toque em qualquer lugar para fechar
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer com informações do casamento */}
            <footer className="bg-gradient-to-r from-slate-700 via-blue-800 to-slate-700 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    {/* Ornamental divider */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                        <div className="mx-6 text-rose-200 text-3xl">💒</div>
                        <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-light font-serif mb-4">Larissa & Guilherme</h3>
                        <p className="text-blue-100 mb-6 font-light leading-relaxed">
                            &quot;O amor é paciente, o amor é bondoso... e hoje celebramos o início de uma nova jornada juntos.
                            Obrigada por fazerem parte deste momento tão especial em nossas vidas!&ldquo;
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-lg mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="text-rose-200 text-lg font-light">Data do Casamento</div>
                                <div className="text-xl font-medium">13 • 09 • 2025</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="text-rose-200 text-lg font-light">Premiação da Rifa</div>
                                <div className="text-xl font-medium">R$ 500,00</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <a
                                href="https://www.casamentolarigui.com.br"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-200 hover:text-white transition-colors font-light"
                            >
                                🌐 www.casamentolarigui.com.br
                            </a>
                            <span className="hidden sm:block text-rose-300">•</span>
                            <span className="text-blue-200 font-light">📱 WhatsApp: (61) 99324-8349</span>
                        </div>

                        <div className="text-sm text-blue-200 font-light">
                            Desenvolvido com 💕 para celebrar o amor de Larissa & Guilherme
                        </div>
                    </div>

                    {/* Ornamental divider */}
                    <div className="flex items-center justify-center mt-8">
                        <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                        <div className="mx-6 text-rose-200 text-2xl">💙</div>
                        <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent flex-1"></div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                /* Floral decorative elements */
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                
                .float-animation {
                    animation: float 6s ease-in-out infinite;
                }
                
                /* Shimmer effect for premium elements */
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                }
                
                /* Pulse effect for hearts */
                @keyframes pulse-heart {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                .animate-pulse-heart {
                    animation: pulse-heart 2s ease-in-out infinite;
                }
                
                /* Romantic gradient text */
                .wedding-text {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Custom scrollbar for webkit browsers */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #f472b6, #ec4899);
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #ec4899, #db2777);
                }

                /* Smooth transitions for all interactive elements */
                * {
                    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 300ms;
                }

                /* Focus styles for accessibility */
                button:focus,
                input:focus,
                a:focus {
                    outline: 2px solid #f472b6;
                    outline-offset: 2px;
                }

                /* Custom selection colors */
                ::selection {
                    background-color: #fce7f3;
                    color: #be185d;
                }

                /* Responsive text sizes */
                @media (max-width: 640px) {
                    .responsive-text-xl {
                        font-size: 1.125rem;
                        line-height: 1.75rem;
                    }
                }
            `}</style>
        </div>
    );
}

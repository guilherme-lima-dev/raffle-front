"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        const fetchRaffle = async () => {
            try {
                const response = await axios.get<Raffle>('https://raffle.popingressos.com.br/raffles/acff1926-703a-11ef-adb4-028b968b3f3d');
                setRaffle(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load raffle data');
                setLoading(false);
            }
        };

        fetchRaffle();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
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
        try {
            const response = await axios.post('https://raffle.popingressos.com.br/orders', {
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
        }
    };

    const sendWhatsAppMessage = (orderId: string) => {
        const whatsappNumber = '5561993248349';
        const message = `Oii Lari, gostaria de comprar os números: ${selectedNumbers.join(', ')} da rifa ${raffle?.name}. Meu número de pedido é ${orderId}.`;
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
        navigator.clipboard.writeText(pixKey);
        setPixMessage('Chave PIX copiada para a área de transferência!');
        setTimeout(() => setPixMessage(null), 3000);
    };

    if (loading) {
        return <div className="text-center">Carregando...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-blue-50 py-10">
            <div className="container mx-auto px-4">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h1 className="text-4xl font-bold text-blue-800 mb-4">{raffle?.name}</h1>
                    <p className="text-gray-600 mb-2">{raffle?.description}</p>
                    <p className="text-blue-800 font-semibold mb-4">Preço por número: R$ {raffle?.price}</p>
                    <p className="text-blue-800 font-semibold mb-4">Quantidade de números: {raffle?.total_numbers}</p>
                    <p className="text-blue-800 font-semibold mb-4">Premiação: R$ 500</p>
                    <p className="mt-4 mb-2 text-black cursor-pointer" onClick={handleCopyPix}>
                        Chave PIX (Telefone): <b className="underline">61993248349</b>
                    </p>
                    {pixMessage && <p className="text-green-500">{pixMessage}</p>}

                    <div className="my-4">
                        <label className="block text-blue-800 font-semibold mb-2">Seleção Aleatória:</label>
                        <input
                            type="number"
                            placeholder="Quantidade de números"
                            value={randomSelectionCount}
                            onChange={(e) => setRandomSelectionCount(Number(e.target.value))}
                            className="w-full px-3 py-2 mb-4 border rounded-md text-black max-w-sm mr-2"
                        />
                        <button
                            onClick={handleRandomSelection}
                            disabled={randomSelectionCount <= 0 || randomSelectionCount > raffle?.numbers.length}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Selecionar Números Aleatórios
                        </button>
                    </div>

                    <div className="mt-6 mb-6">
                        <p className="text-blue-800 font-semibold">Números selecionados: {selectedNumbers.join(', ') || 'Nenhum'}</p>
                    </div>

                    <div className="row-auto flex items-center justify-center">
                        <div className={`${isScrolled ? 'fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full w-96 max-w-md px-4' : 'w-96 text-center my-6 max-w-md px-4'}`}>
                            <button
                                onClick={() => setShowModal(true)}
                                disabled={selectedNumbers.length === 0}
                                className={`w-full py-4 rounded-full text-white font-semibold transition duration-200 shadow-lg
                                    ${selectedNumbers.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}
                                `}
                            >
                                Comprar
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mb-32">
                        {raffle?.numbers.map((num) => (
                            <div
                                key={num.external_id}
                                className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer
                                    ${num.status === 'available' ? (selectedNumbers.includes(num.number) ? 'bg-blue-500 text-white' : 'bg-blue-200 hover:bg-blue-300') : 'bg-gray-400 cursor-not-allowed'}
                                `}
                                onClick={() => num.status === 'available' && handleSelectNumber(num.number)}
                            >
                                {num.number}
                            </div>
                        ))}
                    </div>

                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                                <h2 className="text-xl font-semibold mb-4 text-black">Confirme seu Pedido</h2>
                                <p className="mt-6 mb-2 text-black cursor-pointer" onClick={handleCopyPix}>
                                    Chave PIX (Telefone): <b className="underline">61993248349</b>
                                </p>
                                {pixMessage && <p className="text-green-500">{pixMessage}</p>}
                                <p className="mb-2 text-black">Números selecionados: {selectedNumbers.join(', ')}</p>
                                <input
                                    type="text"
                                    placeholder="Nome"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 mb-4 border rounded-md text-black"
                                />
                                <input
                                    type="text"
                                    placeholder="Telefone (opcional)"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full px-3 py-2 mb-4 border rounded-md text-black"
                                />
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmOrder}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showSuccessModal && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                            onClick={handleCloseSuccessModal}
                        >
                            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                                <h2 className="text-2xl font-semibold text-green-500 mb-4">Pedido Confirmado!</h2>
                                <div className="text-6xl mb-4">🎉</div>
                                <p className="text-gray-800 font-semibold">Seu pedido foi registrado com sucesso!</p>
                                <p className="text-gray-600 mb-6">Agora, envie o comprovante para confirmar sua compra.</p>
                                <button
                                    onClick={handleCloseSuccessModal}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Função para buscar os dados da rifa
        const fetchRaffle = async () => {
            try {
                const response = await axios.get<Raffle>('http://localhost:3001/raffles/acff1926-703a-11ef-adb4-028b968b3f3d');
                setRaffle(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load raffle data');
                setLoading(false);
            }
        };

        fetchRaffle();
    }, []);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!raffle) {
        return <div className="text-center">Raffle not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="container mx-auto px-4">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{raffle.name}</h1>
                    <p className="text-gray-600 mb-2">{raffle.description}</p>
                    <p className="text-gray-800 font-semibold mb-4">Price per number: R$ {raffle.price}</p>
                    <p className="text-gray-800 font-semibold mb-4">Total numbers: {raffle.total_numbers}</p>
                    <p className="text-gray-800 font-semibold mb-6">Status: {raffle.status}</p>

                    {/* Grid de Números */}
                    <div className="grid grid-cols-5 gap-4">
                        {raffle.numbers.map((num) => (
                            <div
                                key={num.external_id}
                                className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer
                                ${num.status === 'available' ? 'bg-blue-200 hover:bg-blue-300' : 'bg-gray-400 cursor-not-allowed'}
                                `}
                            >
                                {num.number}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

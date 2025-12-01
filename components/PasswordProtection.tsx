import React, { useState } from 'react';

interface PasswordProtectionProps {
    isPasswordSet: boolean;
    onLogin: (password: string) => Promise<boolean>;
    onSetPassword: (password: string) => Promise<void>;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ isPasswordSet, onLogin, onSetPassword }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!password) {
            setError('La password non può essere vuota.');
            return;
        }
        const success = await onLogin(password);
        if (!success) {
            setError('Password errata. Riprova.');
            setPassword('');
        }
    };

    const handleSetupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!password || !confirmPassword) {
            setError('Tutti i campi sono obbligatori.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Le password non coincidono.');
            return;
        }
        if (password.length < 6) {
            setError('La password deve essere di almeno 6 caratteri.');
            return;
        }
        await onSetPassword(password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl">
                {!isPasswordSet ? (
                    // Setup View
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-800">Crea la tua Password</h2>
                        <p className="mt-2 text-sm text-center text-gray-600">
                            Benvenuto! Per proteggere i tuoi dati, imposta una password per il calendario.
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleSetupSubmit}>
                             <div>
                                <label htmlFor="new-password" className="sr-only">Nuova Password</label>
                                <input
                                    id="new-password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Nuova Password (min. 6 caratteri)"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="sr-only">Conferma Password</label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Conferma Password"
                                />
                            </div>

                            {error && <p className="text-sm text-center text-red-600">{error}</p>}

                            <div>
                                <button type="submit" className="group relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Imposta Password e Accedi
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // Login View
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-800">Accesso Richiesto</h2>
                        <p className="mt-2 text-sm text-center text-gray-600">
                           Per accedere all'APP Calendario è richiesta la Password.
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Password"
                            />
                            {error && <p className="text-sm text-center text-red-600">{error}</p>}
                            <div>
                                <button type="submit" className="group relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Accedi
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordProtection;

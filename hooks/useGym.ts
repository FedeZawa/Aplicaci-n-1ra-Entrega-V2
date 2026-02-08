import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const useGym = () => {
    const [loading, setLoading] = useState(false);

    /**
     * Obtiene todas las clases activas.
     */
    const getClasses = async () => {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data;
    };

    /**
     * Obtiene las sesiones disponibles para una fecha específica.
     */
    const getSessionsByDate = async (date: string) => {
        const { data, error } = await supabase
            .from('class_sessions')
            .select('*, classes(name, image_url)')
            .eq('session_date', date)
            .eq('status', 'available')
            .order('start_time');

        if (error) throw error;
        return data;
    };

    /**
     * Obtiene las reservas del usuario actual.
     */
    const getUserReservations = async (userId: string) => {
        const { data, error } = await supabase
            .from('reservations')
            .select('*, class_sessions(*, classes(name))')
            .eq('user_id', userId)
            .eq('status', 'confirmed');

        if (error) throw error;
        return data;
    };

    /**
     * Realiza una reserva invocando a la Edge Function de validación.
     * Este es el único punto de entrada para crear reservas garantizando Zero Trust.
     */
    const bookSession = async (sessionId: string, userId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('validate-booking', {
                body: { session_id: sessionId, user_id: userId },
            });

            // Manejo de errores de red o invocación
            if (error) throw error;

            // Manejo de errores de negocio retornados por la Edge Function
            if (data && data.error) {
                throw new Error(data.error);
            }

            return data;
        } finally {
            setLoading(false);
        }
    };

    return {
        getClasses,
        getSessionsByDate,
        getUserReservations,
        bookSession,
        loading
    };
};

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    // Manejo de CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    persistSession: false,
                },
            }
        );

        const { session_id, user_id } = await req.json();

        if (!session_id || !user_id) {
            return new Response(
                JSON.stringify({ error: 'Faltan parámetros: session_id y user_id son requeridos.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 1. Obtener ajustes de la app, perfil del usuario y detalles de la sesión simultáneamente
        const [
            { data: settings },
            { data: profile, error: profileError },
            { data: session, error: sessionError }
        ] = await Promise.all([
            supabaseClient.from('app_settings').select('*'),
            supabaseClient.from('profiles').select('is_active, role').eq('id', user_id).single(),
            supabaseClient.from('class_sessions').select('session_date, start_time, capacity, status').eq('id', session_id).single()
        ]);

        if (profileError || !profile) throw new Error('Usuario no encontrado.');
        if (sessionError || !session) throw new Error('Sesión no encontrada.');

        // Mapear settings
        const settingsMap = Object.fromEntries(settings?.map(s => [s.key, s.value]) ?? []);
        const minHoursAdvance = parseInt(settingsMap.min_hours_advance ?? '12');
        const maxActiveReservations = parseInt(settingsMap.max_active_reservations ?? '5');

        // --- VALIDACIONES ---

        // A. Validar Usuario Activo
        if (!profile.is_active) {
            return new Response(
                JSON.stringify({ error: 'Tu cuenta está inactiva. Contacta al administrador.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // B. Validar Estado de la Sesión
        if (session.status !== 'available') {
            return new Response(
                JSON.stringify({ error: `La sesión no está disponible (Estado: ${session.status}).` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // C. Validar Duplicado
        const { data: existingBooking } = await supabaseClient
            .from('reservations')
            .select('id')
            .eq('session_id', session_id)
            .eq('user_id', user_id)
            .eq('status', 'confirmed')
            .maybeSingle();

        if (existingBooking) {
            return new Response(
                JSON.stringify({ error: 'Ya tienes una reserva confirmada para esta clase.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // D. Validar Anticipación
        const sessionDateTime = new Date(`${session.session_date}T${session.start_time}`);
        const now = new Date();
        const hoursDiff = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < minHoursAdvance) {
            return new Response(
                JSON.stringify({ error: `Debe reservar con al menos ${minHoursAdvance} horas de anticipación.` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // E. Validar Capacidad Disponible
        const { count: currentReservations } = await supabaseClient
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session_id)
            .eq('status', 'confirmed');

        if ((currentReservations ?? 0) >= session.capacity) {
            return new Response(
                JSON.stringify({ error: 'Lo sentimos, la clase ya alcanzó su capacidad máxima.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // F. Validar Límite de Reservas Activas del Usuario
        const { count: userReservations } = await supabaseClient
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .eq('status', 'confirmed');

        if ((userReservations ?? 0) >= maxActiveReservations) {
            return new Response(
                JSON.stringify({ error: `Has alcanzado tu límite de ${maxActiveReservations} reservas activas simultáneas.` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- PROCESAMIENTO ---

        // Insertar la reserva
        const { data: newReservation, error: insertError } = await supabaseClient
            .from('reservations')
            .insert([{
                session_id,
                user_id,
                status: 'confirmed'
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        return new Response(
            JSON.stringify({
                message: 'Reserva confirmada con éxito.',
                data: newReservation
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error en validate-booking:', error.message);
        return new Response(
            JSON.stringify({ error: error.message || 'Error interno del servidor.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

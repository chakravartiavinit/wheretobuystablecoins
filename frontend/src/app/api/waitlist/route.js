import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('waitlist')
            .insert([{ email }]);

        if (error) {
            console.error('Supabase error:', error);

            // Check for unique constraint violation (Supabase/Postgres code 23505)
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Already on waitlist' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: 'Something Went Wrong' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Successfully joined the waitlist!' },
            { status: 200 }
        );
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

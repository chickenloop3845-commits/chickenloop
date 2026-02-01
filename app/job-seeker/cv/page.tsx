'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { cvApi } from '@/lib/api';
import Navbar from '../../components/Navbar';

export default function CVPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && user.role !== 'job-seeker') {
            router.push(`/${user.role === 'admin' ? 'admin' : 'recruiter'}`);
            return;
        }

        if (user && !authLoading) {
            checkCV();
        }
    }, [user, authLoading, router]);

    const checkCV = async () => {
        try {
            // Attempt to fetch the CV
            await cvApi.get();
            // If successful, redirect to view
            router.replace('/job-seeker/cv/view');
        } catch (error) {
            // If it fails (likely 404/not found), redirect to create new
            router.replace('/job-seeker/cv/new');
        } finally {
            // We don't really need to set checking to false if we redirect, 
            // but strictly speaking for cleanup or if redirect fails:
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
            <Navbar />
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 font-medium">Checking CV status...</p>
                </div>
            </div>
        </div>
    );
}

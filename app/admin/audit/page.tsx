
'use client';

import React, { useEffect, useState } from 'react';

export default function AuditPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [jobsRes, candsRes] = await Promise.all([
                fetch('/api/jobs'),
                fetch('/api/candidates-list') // This might fail if not logged in, we'll see
            ]);

            const jobsData = await jobsRes.json();
            // For candidates, we might need to mock or use a public route if auth fails
            // But let's try.

            const allItems = [];

            if (jobsData.jobs) {
                allItems.push(...jobsData.jobs.map((j: any) => ({
                    id: j._id,
                    type: 'JOB',
                    text: j.title,
                    subtext: j.description?.substring(0, 100),
                    image: j.pictures?.[0]
                })));
            }

            setItems(allItems);
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-10">Loading Audit Data...</div>;

    return (
        <div className="p-10 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Image Harmony Audit Gallery</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded shadow flex flex-col">
                        <div className="h-48 bg-gray-200 mb-4 overflow-hidden rounded relative">
                            {item.image ? (
                                <img src={item.image} alt={item.text} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                            <div className="absolute top-0 right-0 bg-black/50 text-white px-2 py-1 text-xs">
                                {item.type}
                            </div>
                        </div>
                        <h2 className="font-bold text-lg mb-2">{item.text}</h2>
                        <p className="text-xs text-gray-500 mb-2">{item.id}</p>
                        <p className="text-sm text-gray-700">{item.subtext}...</p>
                    </div>
                ))}
            </div>
        </div>
    );
}


import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';

export async function GET() {
    try {
        await connectDB();
        // Create index on createdAt for sorting
        await Job.collection.createIndex({ createdAt: -1 });
        return NextResponse.json({ message: 'Index created successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

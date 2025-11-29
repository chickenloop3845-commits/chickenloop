
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://cl1-ashen.vercel.app';

// Image Paths (Hardcoded from generation steps)
const LOGO_PATH = '/Users/joco/.gemini/antigravity/brain/7c386519-7f87-44b7-b841-63bea3f3d05b/company_logo_hq_1764416575867.png';
const ACTION_PATH = '/Users/joco/.gemini/antigravity/brain/7c386519-7f87-44b7-b841-63bea3f3d05b/job_action_shot_hq_1764416588978.png';
const HEADSHOT_PATH = '/Users/joco/.gemini/antigravity/brain/7c386519-7f87-44b7-b841-63bea3f3d05b/cv_headshot_hq_1764417051943.png';

// Helper to read image as Base64 Data URI
const getImageDataUri = (filePath: string) => {
    try {
        const bitmap = fs.readFileSync(filePath);
        const base64 = Buffer.from(bitmap).toString('base64');
        return `data:image/png;base64,${base64}`;
    } catch (e) {
        console.error(`Error reading file ${filePath}:`, e);
        return null;
    }
};

const randomString = () => Math.random().toString(36).substring(7);

async function seedHQData() {
    console.log('🚀 Seeding High-Quality Data & Images...');

    try {
        // 1. Prepare Images
        console.log('📸 Preparing Images...');
        const logoUri = getImageDataUri(LOGO_PATH);
        const actionUri = getImageDataUri(ACTION_PATH);
        const headshotUri = getImageDataUri(HEADSHOT_PATH);

        if (!logoUri || !actionUri || !headshotUri) {
            throw new Error('Failed to load one or more images');
        }

        // 2. Register Recruiter (Sarah Jenkins)
        console.log('👤 Registering Recruiter: Sarah Jenkins...');
        const rEmail = `sarah.jenkins.${randomString()}@watersports.com`;
        const rPass = 'securePass123!';

        let res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: rEmail, password: rPass, name: 'Sarah Jenkins', role: 'recruiter' })
        });
        if (!res.ok) throw new Error(`Register Recruiter failed: ${res.status}`);

        // Login Recruiter
        res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: rEmail, password: rPass })
        });
        if (!res.ok) throw new Error(`Login Recruiter failed: ${res.status}`);
        const rCookie = res.headers.get('set-cookie') || '';

        // 3. Create Company (Tarifa Kite School)
        console.log('🏢 Creating Company: Tarifa Kite School...');
        res = await fetch(`${BASE_URL}/api/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': rCookie },
            body: JSON.stringify({
                name: 'Tarifa Kite School',
                description: 'Premier kitesurfing center in Tarifa, offering certified IKO courses and premium equipment rental since 2010.',
                coordinates: { latitude: 36.0127, longitude: -5.6027 }, // Tarifa
                address: { city: 'Tarifa', country: 'ES' },
                logo: logoUri // Injecting Base64 Logo
            })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Create Company failed: ${JSON.stringify(err)}`);
        }

        // 10-Point Data Check Function
        const validateData = (label: string, data: any, checks: Array<(d: any) => boolean | string>) => {
            console.log(`🔍 Validating ${label} (10-Point Check)...`);
            let passed = 0;
            checks.forEach((check, i) => {
                const result = check(data);
                if (result === true) {
                    passed++;
                } else {
                    console.warn(`  ⚠️ Check ${i + 1} Failed: ${result}`);
                }
            });
            if (passed === checks.length) {
                console.log(`  ✅ All ${passed} checks passed for ${label}.`);
            } else {
                throw new Error(`Validation failed for ${label}. Only ${passed}/${checks.length} checks passed.`);
            }
        };

        // 4. Post Job (Senior Instructor)
        console.log('🏄 Posting Job: Senior Kitesurfing Instructor...');
        const jobData = {
            title: 'Senior Kitesurfing Instructor',
            description: 'We are looking for an experienced IKO Level 2 instructor for the upcoming summer season (June-September). Must be fluent in English and Spanish. Accommodation provided.',
            location: 'Tarifa',
            country: 'ES',
            type: 'contract', // Corrected from 'seasonal'
            salary: '2500',
            published: true,
            pictures: [actionUri]
        };

        validateData('Job Data', jobData, [
            d => d.title.length > 10 || "Title too short",
            d => d.description.length > 50 || "Description too short",
            d => ['ES', 'US', 'GB'].includes(d.country) || "Invalid Country Code",
            d => ['full-time', 'part-time', 'contract', 'freelance'].includes(d.type) || "Invalid Job Type",
            d => !isNaN(Number(d.salary)) || "Salary must be numeric string",
            d => d.pictures.length > 0 || "Must have at least one picture",
            d => d.pictures[0].startsWith('data:image') || "Picture must be Base64 Data URI",
            d => d.location === 'Tarifa' || "Location mismatch",
            d => d.published === true || "Job must be published",
            d => d.description.includes('IKO') || "Description missing keywords"
        ]);

        res = await fetch(`${BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': rCookie },
            body: JSON.stringify(jobData)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Post Job failed: ${JSON.stringify(err)}`);
        }

        // 5. Register Seeker (Mike Boardman)
        console.log('👤 Registering Seeker: Mike Boardman...');
        const sEmail = `mike.boardman.${randomString()}@gmail.com`;
        const sPass = 'securePass123!';

        res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sEmail, password: sPass, name: 'Mike Boardman', role: 'job-seeker' })
        });
        if (!res.ok) throw new Error(`Register Seeker failed: ${res.status}`);

        // Login Seeker
        res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sEmail, password: sPass })
        });
        if (!res.ok) throw new Error(`Login Seeker failed: ${res.status}`);
        const sCookie = res.headers.get('set-cookie') || '';

        // 6. Create CV
        console.log('📄 Creating CV for Mike...');
        const cvData = {
            fullName: 'Mike Boardman',
            email: sEmail,
            summary: 'Passionate water sports enthusiast with 5 years of teaching experience. IKO Level 2 certified.',
            skills: ['Kitesurfing', 'Windsurfing', 'First Aid', 'English', 'Spanish'],
            experience: [{
                title: 'Kite Instructor',
                company: 'Windy Beach Club',
                startDate: '2020-05-01',
                endDate: '2023-09-01',
                description: 'Taught beginner to advanced lessons.'
            }],
            pictures: [headshotUri]
        };

        validateData('CV Data', cvData, [
            d => d.fullName.length > 5 || "Name too short",
            d => d.email.includes('@') || "Invalid email",
            d => d.summary.length > 20 || "Summary too short",
            d => d.skills.length >= 3 || "Not enough skills",
            d => d.experience.length > 0 || "Must have experience",
            d => d.pictures.length > 0 || "Must have profile picture",
            d => d.pictures[0].startsWith('data:image') || "Picture must be Base64",
            d => d.experience[0].startDate < d.experience[0].endDate || "Invalid dates",
            d => d.skills.includes('Kitesurfing') || "Missing key skill",
            d => d.summary.includes('IKO') || "Summary missing keywords"
        ]);

        res = await fetch(`${BASE_URL}/api/cv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': sCookie },
            body: JSON.stringify(cvData)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Create CV failed: ${JSON.stringify(err)}`);
        }

        console.log('✅ HQ Data Seeding Complete!');
        console.log(`Recruiter: ${rEmail}`);
        console.log(`Seeker: ${sEmail}`);

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
}

seedHQData();

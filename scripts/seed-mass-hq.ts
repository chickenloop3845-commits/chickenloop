import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://cl1-ashen.vercel.app';

// Helper to fetch image and convert to Base64
const fetchImageAsBase64 = async (keyword: string, lock: number, type: 'job' | 'person' | 'logo') => {
    try {
        const width = type === 'logo' ? 200 : (type === 'person' ? 400 : 800);
        const height = type === 'logo' ? 200 : (type === 'person' ? 400 : 600);
        // Using loremflickr for reliable keyword-based images
        // Adding a random query param to avoid caching issues if lock is reused
        const url = `https://loremflickr.com/${width}/${height}/${keyword}?lock=${lock}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    } catch (e) {
        console.error(`Error fetching image for ${keyword}:`, e);
        return null;
    }
};

const randomString = () => Math.random().toString(36).substring(7);
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Data Pools
const LOCATIONS = [
    { city: 'Tarifa', country: 'ES', lat: 36.0127, lng: -5.6027 },
    { city: 'Cabarete', country: 'DO', lat: 19.7499, lng: -70.4083 },
    { city: 'Cape Town', country: 'ZA', lat: -33.9249, lng: 18.4241 },
    { city: 'Maui', country: 'US', lat: 20.7984, lng: -156.3319 },
    { city: 'Leucate', country: 'FR', lat: 42.9108, lng: 3.0286 },
    { city: 'Fuerteventura', country: 'ES', lat: 28.3587, lng: -14.0536 },
    { city: 'Dakhla', country: 'MA', lat: 23.7155, lng: -15.9388 },
    { city: 'Jericoacoara', country: 'BR', lat: -2.7963, lng: -40.5142 },
    { city: 'Squamish', country: 'CA', lat: 49.7016, lng: -123.1558 },
    { city: 'Lake Garda', country: 'IT', lat: 45.6049, lng: 10.6351 }
];

const COMPANY_TYPES = [
    { name: 'Kite', keywords: 'kitesurfing,kiteboarding' },
    { name: 'Surf', keywords: 'surfing,waves' },
    { name: 'Dive', keywords: 'scuba,diving,underwater' },
    { name: 'Wind', keywords: 'windsurfing,sail' },
    { name: 'Sup', keywords: 'paddleboard,sup' }
];

const COMPANY_SUFFIXES = ['Center', 'School', 'Academy', 'Club', 'Adventures', 'Watersports', 'Pro Center'];

const JOB_ROLES = [
    { title: 'Instructor', keywords: 'instructor,teaching' },
    { title: 'Manager', keywords: 'manager,office' },
    { title: 'Photographer', keywords: 'camera,photography' },
    { title: 'Repair Specialist', keywords: 'repair,workshop' },
    { title: 'Shop Assistant', keywords: 'shop,retail' }
];

const SEEKER_NAMES = [
    'Alex Rivera', 'Sarah Connor', 'Mike Ross', 'Jessica Pearson', 'Harvey Specter',
    'Louis Litt', 'Donna Paulsen', 'Rachel Zane', 'John Wick', 'Ellen Ripley',
    'Marty McFly', 'Doc Brown', 'Luke Skywalker', 'Leia Organa', 'Han Solo',
    'James Bond', 'Ethan Hunt', 'Jason Bourne', 'Lara Croft', 'Indiana Jones',
    'Jack Sparrow', 'Tony Stark', 'Bruce Wayne', 'Clark Kent', 'Diana Prince'
];

const SKILLS = ['Kitesurfing', 'Windsurfing', 'Surfing', 'Sailing', 'First Aid', 'PADI', 'IKO Level 2', 'Driving License', 'Photography', 'Management'];

async function seedMassHQ() {
    console.log('🚀 Starting Mass HQ Seeding (50 Unique Context-Aware Entities)...');

    let successCount = 0;

    // --- 1. Create 25 Companies & Jobs ---
    console.log('\n🏢 Creating 25 Companies & Jobs with Unique Images...');
    for (let i = 0; i < 25; i++) {
        try {
            const loc = randomItem(LOCATIONS);
            const type = randomItem(COMPANY_TYPES);
            const coName = `${type.name} ${randomItem(COMPANY_SUFFIXES)} ${randomString()}`;
            const email = `recruiter_hq_${i}_${randomString()}@test.com`;
            const password = 'password123';

            // Fetch Contextual Images
            const logo = await fetchImageAsBase64(`${type.keywords},logo,minimal`, i, 'logo');

            const role = randomItem(JOB_ROLES);
            const jobTitle = `Senior ${type.name} ${role.title}`;
            const jobImage = await fetchImageAsBase64(`${type.keywords},${role.keywords},action`, i + 100, 'job');

            // Register
            let res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name: `Recruiter ${i}`, role: 'recruiter' })
            });
            if (!res.ok) continue;

            // Login
            res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) continue;
            const cookie = res.headers.get('set-cookie') || '';

            // Create Company
            res = await fetch(`${BASE_URL}/api/company`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
                body: JSON.stringify({
                    name: coName,
                    description: `Premium ${type.name} center located in beautiful ${loc.city}. We offer top-tier equipment and certified instruction.`,
                    coordinates: { latitude: loc.lat, longitude: loc.lng },
                    address: { city: loc.city, country: loc.country },
                    logo: logo
                })
            });
            if (!res.ok) continue;

            // Post Job
            res = await fetch(`${BASE_URL}/api/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
                body: JSON.stringify({
                    title: jobTitle,
                    description: `Exciting opportunity in ${loc.city}! We are looking for a motivated ${role.title} to join our team. Competitive salary and great vibes.`,
                    location: loc.city,
                    country: loc.country,
                    type: randomItem(['full-time', 'part-time', 'contract', 'freelance']),
                    salary: `${randomInt(1500, 4000)}`,
                    published: true,
                    pictures: jobImage ? [jobImage] : []
                })
            });
            if (res.ok) {
                successCount++;
                process.stdout.write('.');
            }

            // Small delay to be nice to the image service
            await new Promise(r => setTimeout(r, 500));

        } catch (e) {
            console.error('Error in loop:', e);
        }
    }

    // --- 2. Create 25 Seekers & CVs ---
    console.log('\n\n👤 Creating 25 Seekers & CVs with Unique Headshots...');
    for (let i = 0; i < 25; i++) {
        try {
            const name = randomItem(SEEKER_NAMES) + ` ${randomString()}`; // Ensure unique name
            const email = `seeker_hq_${i}_${randomString()}@test.com`;
            const password = 'password123';

            // Fetch Headshot
            const headshot = await fetchImageAsBase64('portrait,face,professional', i + 200, 'person');

            // Register
            let res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, role: 'job-seeker' })
            });
            if (!res.ok) continue;

            // Login
            res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) continue;
            const cookie = res.headers.get('set-cookie') || '';

            // Create CV
            res = await fetch(`${BASE_URL}/api/cv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
                body: JSON.stringify({
                    fullName: name,
                    email: email,
                    summary: `Experienced professional with a passion for watersports. I have worked in multiple countries and hold various certifications.`,
                    skills: [randomItem(SKILLS), randomItem(SKILLS), randomItem(SKILLS)],
                    experience: [{
                        title: 'Instructor',
                        company: 'Previous Co',
                        startDate: '2020-01-01',
                        endDate: '2022-01-01',
                        description: 'Great experience.'
                    }],
                    pictures: headshot ? [headshot] : []
                })
            });
            if (res.ok) {
                successCount++;
                process.stdout.write('.');
            }

            // Small delay
            await new Promise(r => setTimeout(r, 500));

        } catch (e) {
            console.error('Error in loop:', e);
        }
    }

    console.log(`\n\n✅ Mass HQ Seeding Complete! Created ${successCount} entities with unique images.`);
}

seedMassHQ();

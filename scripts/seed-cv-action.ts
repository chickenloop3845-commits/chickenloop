
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://cl1-ashen.vercel.app';

// Helper to fetch image and convert to Base64
const fetchImageAsBase64 = async (keyword: string, lock: number) => {
    try {
        // Fetching a slightly larger action shot for CVs
        const url = `https://loremflickr.com/800/600/${keyword}?lock=${lock}`;

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
const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Specific Profiles requested by user + others (Total 20)
const PROFILES = [
    {
        role: 'Scuba Dive Master',
        keywords: 'scuba,diving,underwater',
        skills: ['PADI Dive Master', 'Deep Diving', 'Equipment Repair', 'Nitrox'],
        summary: 'Passionate diver with 5 years of experience exploring underwater worlds. Expert in guiding groups and safety protocols.'
    },
    {
        role: 'Professional Swimmer',
        keywords: 'swimming,swimmer,pool,athlete',
        skills: ['Competitive Swimming', 'Lifeguard', 'Swim Coaching', 'CPR'],
        summary: 'Former competitive swimmer turned coach. Dedicated to teaching proper technique and water safety.'
    },
    {
        role: 'Beach Bar Mixologist',
        keywords: 'bartender,cocktail,beach,bar',
        skills: ['Mixology', 'Customer Service', 'Inventory Management', 'Flair Bartending'],
        summary: 'Creative barman with a flair for exotic cocktails. I bring energy and great drinks to any beach bar.'
    },
    {
        role: 'Kitesurf Instructor',
        keywords: 'kitesurfing,kiteboarding,jump',
        skills: ['IKO Level 2', 'Freestyle Coaching', 'Equipment Repair', 'Rescue'],
        summary: 'Adrenaline junkie and certified instructor. I love teaching beginners and coaching advanced riders in freestyle.'
    },
    {
        role: 'Windsurf Pro',
        keywords: 'windsurfing,sail,ocean',
        skills: ['Windsurfing', 'Sailing', 'Wave Riding', 'Competition Strategy'],
        summary: 'Windsurfing pro with international competition experience. Available for clinics and advanced coaching.'
    },
    {
        role: 'Sup Yoga Teacher',
        keywords: 'yoga,paddleboard,meditation,beach',
        skills: ['Hatha Yoga', 'SUP Yoga', 'Meditation', 'Wellness'],
        summary: 'Certified yoga instructor specializing in floating sessions on paddleboards. Focus on balance, core, and serenity.'
    },
    {
        role: 'Yacht Chef',
        keywords: 'chef,cooking,kitchen,yacht',
        skills: ['Culinary Arts', 'Menu Planning', 'Seafood Specialist', 'Provisioning'],
        summary: 'Experienced chef passionate about fresh, local ingredients. Specializing in high-end cuisine for yacht charters.'
    },
    {
        role: 'Surf Photographer',
        keywords: 'photographer,camera,surf,waterhousing',
        skills: ['Water Photography', 'Editing', 'Drone Piloting', 'Swimming'],
        summary: 'Capturing the perfect moment in the waves. Specialized in water housing photography and drone shots.'
    },
    {
        role: 'Wakeboard Coach',
        keywords: 'wakeboard,wakeboarding,boat,lake',
        skills: ['Wakeboarding', 'Boat Driving', 'Coaching', 'Cable Park'],
        summary: 'Professional wakeboard coach with experience in both boat and cable parks. Helping riders stomp their first inverts.'
    },
    {
        role: 'Sailing Skipper',
        keywords: 'sailing,yacht,skipper,ocean',
        skills: ['RYA Yachtmaster', 'Navigation', 'Maintenance', 'Hospitality'],
        summary: 'Seasoned skipper with thousands of nautical miles. I deliver safe and unforgettable sailing holidays.'
    },
    {
        role: 'Beach Lifeguard',
        keywords: 'lifeguard,beach,rescue,baywatch',
        skills: ['Surf Rescue', 'First Aid', 'CPR', 'Risk Assessment'],
        summary: 'Vigilant and fit lifeguard dedicated to keeping the beach safe. Experienced in high-surf conditions.'
    },
    {
        role: 'Marine Biologist Guide',
        keywords: 'marine,biology,coral,reef',
        skills: ['Marine Biology', 'Snorkeling Guide', 'Conservation', 'Public Speaking'],
        summary: 'Educating guests about the marine ecosystem. I lead eco-tours and snorkeling trips with a focus on conservation.'
    },
    {
        role: 'Jet Ski Mechanic',
        keywords: 'mechanic,jetski,engine,workshop',
        skills: ['Engine Repair', 'Diagnostics', 'Maintenance', 'Welding'],
        summary: 'Expert mechanic specializing in personal watercraft. I keep the fleet running smoothly and reliably.'
    },
    {
        role: 'Fishing Guide',
        keywords: 'fishing,fisherman,boat,catch',
        skills: ['Deep Sea Fishing', 'Fly Fishing', 'Boat Handling', 'Fish Cleaning'],
        summary: 'Local fishing expert who knows where the big ones are biting. I provide a complete fishing adventure.'
    },
    {
        role: 'Kayak Tour Leader',
        keywords: 'kayak,kayaking,river,sea',
        skills: ['Kayaking', 'Guide', 'Safety', 'Nature Interpretation'],
        summary: 'Leading scenic kayak tours through mangroves and coastlines. Passionate about nature and outdoor education.'
    },
    {
        role: 'Free Diver Instructor',
        keywords: 'freediving,underwater,breath,ocean',
        skills: ['AIDA Instructor', 'Breathwork', 'Safety', 'Yoga'],
        summary: 'Teaching the art of breath-hold diving. I help students discover their inner potential and the silence of the deep.'
    },
    {
        role: 'Hydrofoil Tester',
        keywords: 'hydrofoil,foil,surfing,future',
        skills: ['Foiling', 'R&D', 'Product Testing', 'Engineering'],
        summary: 'Pushing the limits of foil technology. I test and provide feedback on the latest hydrofoil gear.'
    },
    {
        role: 'Beach Massage Therapist',
        keywords: 'massage,spa,beach,relax',
        skills: ['Deep Tissue', 'Sports Massage', 'Relaxation', 'Anatomy'],
        summary: 'Providing recovery and relaxation for water sports enthusiasts. Specialized in sports massage for surfers.'
    },
    {
        role: 'Yacht Stewardess',
        keywords: 'stewardess,yacht,luxury,service',
        skills: ['Silver Service', 'Hospitality', 'Housekeeping', 'Cocktails'],
        summary: 'Detail-oriented stewardess with experience on superyachts. Delivering 5-star service with a smile.'
    },
    {
        role: 'Surfboard Shaper',
        keywords: 'surfboard,shaper,workshop,craftsman',
        skills: ['Shaping', 'Glassing', 'Design', 'Resin Art'],
        summary: 'Crafting custom surfboards for all levels. I blend traditional craftsmanship with modern hydrodynamics.'
    }
];

const NAMES = [
    'Jordan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Alex', 'Sam', 'Taylor', 'Morgan', 'Avery'
];

async function seedCVAction() {
    console.log('🚀 Starting CV Action Seeding (Context-Aware Action Shots)...');

    let successCount = 0;

    // Create 3 CVs for each profile type (8 profiles * 3 = 24 CVs)
    for (const profile of PROFILES) {
        for (let i = 0; i < 3; i++) {
            try {
                const name = `${randomItem(NAMES)} ${randomString()}`;
                const email = `seeker_action_${profile.role.replace(/\s/g, '')}_${i}_${randomString()}@test.com`;
                const password = 'password123';

                console.log(`\nCreating ${profile.role}: ${name}`);

                // Fetch Action Image
                // Adding unique lock to ensure variety even within same category
                const actionImage = await fetchImageAsBase64(profile.keywords, successCount + 500);

                if (!actionImage) {
                    console.log('Skipping due to image fetch failure');
                    continue;
                }

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
                        summary: profile.summary,
                        skills: profile.skills,
                        experience: [{
                            title: profile.role,
                            company: 'Freelance',
                            startDate: '2021-01-01',
                            endDate: '2023-01-01',
                            description: `Working as a ${profile.role} in various locations.`
                        }],
                        // Putting the action image as the main picture
                        pictures: [actionImage]
                    })
                });
                if (res.ok) {
                    successCount++;
                    process.stdout.write('✅');
                } else {
                    process.stdout.write('❌');
                }

                // Delay to avoid rate limits
                await new Promise(r => setTimeout(r, 800));

            } catch (e) {
                console.error('Error in loop:', e);
            }
        }
    }

    console.log(`\n\n🎉 CV Action Seeding Complete! Created ${successCount} context-aware CVs.`);
}

seedCVAction();

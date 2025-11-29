
const BASE_URL = 'https://cl1-ashen.vercel.app';

async function checkStatus() {
    try {
        console.log('Fetching /api/jobs...');
        const res = await fetch(`${BASE_URL}/api/jobs`);
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            const data = await res.json();
            console.log(`Jobs count: ${data.jobs?.length}`);
            if (data.jobs?.length > 0) {
                console.log('Sample Job ID:', data.jobs[0]._id);
                console.log('Sample Recruiter Email:', data.jobs[0].recruiter?.email);
                console.log('Sample Job Image:', data.jobs[0].pictures?.[0]?.substring(0, 50) + '...');
            }
        } else {
            const text = await res.text();
            console.log('Error Body:', text.substring(0, 200));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

checkStatus();

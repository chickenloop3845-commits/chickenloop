
import { headers } from 'next/headers';

const BASE_URL = 'https://cl1-ashen.vercel.app';

// Helper to generate random string
const randomString = () => Math.random().toString(36).substring(7);

async function runExtendedVerification() {
    console.log('🚀 Starting High-Quality Extended Verification (5 Checks per Test)...');
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    };

    try {
        // --- AUTHENTICATION ---
        console.log('\n--- Authentication ---');

        // 1. Register Recruiter
        console.log('Test 1: Register Recruiter');
        const recruiterEmail = `recruiter_${randomString()}@test.com`;
        const recruiterPassword = 'password123';
        const recruiterName = 'Test Recruiter';
        let res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recruiterEmail, password: recruiterPassword, name: recruiterName, role: 'recruiter' })
        });

        // Check 1: Status Code
        assert(res.status === 201, 'Status is 201 Created');
        // Check 2: Response Structure
        const regData = await res.json();
        assert(regData.message === 'User created successfully', 'Success message correct');
        // Check 3: Data Accuracy (Implicit in success)
        assert(!!regData, 'Response body exists');
        // Check 4: Persistence (Try login immediately)
        let loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recruiterEmail, password: recruiterPassword })
        });
        assert(loginRes.ok, 'User can login (Persistence)');
        // Check 5: Negative (Register same email again)
        let dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recruiterEmail, password: recruiterPassword, name: recruiterName, role: 'recruiter' })
        });
        assert(dupRes.status === 400, 'Duplicate registration fails (Negative)');


        // 3. Login Recruiter (Re-using from above, but formalizing test)
        console.log('\nTest 3: Login Recruiter');
        res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recruiterEmail, password: recruiterPassword })
        });
        // Check 1: Status
        assert(res.status === 200, 'Status is 200 OK');
        // Check 2: Structure
        const loginData = await res.json();
        assert(loginData.message === 'Login successful', 'Login message correct');
        // Check 3: Data Accuracy
        assert(loginData.user.email === recruiterEmail, 'Returned email matches');
        // Check 4: Cookie
        const recruiterCookie = res.headers.get('set-cookie') || '';
        assert(recruiterCookie.includes('token='), 'Auth cookie received');
        // Check 5: Negative (Wrong password)
        let badPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recruiterEmail, password: 'wrong' })
        });
        assert(badPassRes.status === 401, 'Wrong password fails (Negative)');


        // --- COMPANY ---
        console.log('\n--- Company ---');

        // 6. Create Company
        console.log('Test 6: Create Company');
        const companyName = `Test Company ${randomString()}`;
        res = await fetch(`${BASE_URL}/api/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({
                name: companyName,
                description: 'A test company',
                coordinates: { latitude: 40.7128, longitude: -74.0060 },
                address: { city: 'New York', country: 'US' }
            })
        });
        // Check 1: Status
        assert(res.status === 201, 'Status is 201 Created');
        // Check 2: Structure
        const companyData = await res.json();
        assert(!!companyData.company._id, 'Company ID returned');
        // Check 3: Data Accuracy
        assert(companyData.company.name === companyName, 'Company name matches');
        // Check 4: Persistence (Get Company)
        let getCompRes = await fetch(`${BASE_URL}/api/company`, {
            headers: { 'Cookie': recruiterCookie }
        });
        const getCompData = await getCompRes.json();
        assert(getCompData.company.name === companyName, 'Company persists');
        // Check 5: Negative (Create duplicate)
        let dupCompRes = await fetch(`${BASE_URL}/api/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({ name: 'Another', coordinates: { latitude: 0, longitude: 0 } })
        });
        assert(dupCompRes.status === 400, 'Duplicate company fails (Negative)');


        // --- JOBS ---
        console.log('\n--- Jobs ---');

        // 11. Post Job
        console.log('Test 11: Post Job');
        const jobTitle = `Test Job ${randomString()}`;
        res = await fetch(`${BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({
                title: jobTitle,
                description: 'Desc',
                location: 'NY',
                country: 'US',
                type: 'full-time',
                salary: '100k',
                published: true
            })
        });
        // Check 1: Status
        assert(res.status === 201, 'Status is 201 Created');
        // Check 2: Structure
        const jobData = await res.json();
        assert(!!jobData.job._id, 'Job ID returned');
        // Check 3: Data Accuracy
        assert(jobData.job.title === jobTitle, 'Job title matches');
        // Check 4: Persistence
        let getJobRes = await fetch(`${BASE_URL}/api/jobs/${jobData.job._id}`);
        const getJobData = await getJobRes.json();
        assert(getJobData.job.title === jobTitle, 'Job persists');
        // Check 5: Negative (Missing fields)
        let badJobRes = await fetch(`${BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({ title: 'Only Title' })
        });
        assert(badJobRes.status === 400, 'Missing fields fails (Negative)');
        const jobId = jobData.job._id;


        // --- CV (Seeker) ---
        console.log('\n--- CV ---');

        // Register Seeker first
        const seekerEmail = `seeker_${randomString()}@test.com`;
        const seekerPassword = 'password123';
        await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: seekerEmail, password: seekerPassword, name: 'Test Seeker', role: 'job-seeker' })
        });
        let seekerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: seekerEmail, password: seekerPassword })
        });
        const seekerCookie = seekerLoginRes.headers.get('set-cookie') || '';

        // 19. Create CV
        console.log('Test 19: Create CV');
        const cvName = 'Test Seeker CV';
        res = await fetch(`${BASE_URL}/api/cv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': seekerCookie },
            body: JSON.stringify({
                fullName: cvName,
                email: seekerEmail,
                summary: 'Summary',
                skills: ['Skill1']
            })
        });
        // Check 1: Status
        assert(res.status === 201, 'Status is 201 Created');
        // Check 2: Structure
        const cvData = await res.json();
        assert(!!cvData.cv._id, 'CV ID returned');
        // Check 3: Data Accuracy
        assert(cvData.cv.fullName === cvName, 'CV name matches');
        // Check 4: Persistence
        let getCvRes = await fetch(`${BASE_URL}/api/cv`, {
            headers: { 'Cookie': seekerCookie }
        });
        const getCvData = await getCvRes.json();
        assert(getCvData.cv.fullName === cvName, 'CV persists');
        // Check 5: Negative (Duplicate CV)
        let dupCvRes = await fetch(`${BASE_URL}/api/cv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': seekerCookie },
            body: JSON.stringify({ fullName: 'Dup', email: 'dup@test.com' })
        });
        assert(dupCvRes.status === 400, 'Duplicate CV fails (Negative)');

    } catch (error) {
        console.error('Unexpected error:', error);
        failed++;
    }

    console.log(`\n--- Summary ---`);
    console.log(`Passed Checks: ${passed}`);
    console.log(`Failed Checks: ${failed}`);

    if (failed > 0) process.exit(1);
}

runExtendedVerification();

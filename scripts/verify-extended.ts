
import { headers } from 'next/headers';

const BASE_URL = 'https://cl1-ashen.vercel.app';

// Helper to generate random string
const randomString = () => Math.random().toString(36).substring(7);

async function runExtendedVerification() {
    console.log('🚀 Starting Extended Verification (25 Tests)...');
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };

    try {
        // --- AUTHENTICATION ---
        console.log('\n--- Authentication ---');

        // 1. Register Recruiter
        const recruiterEmail = `recruiter_${randomString()}@test.com`;
        const recruiterPassword = 'password123';
        let res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recruiterEmail, password: recruiterPassword, name: 'Test Recruiter', role: 'recruiter' })
        });
        assert(res.ok, 'Register Recruiter');

        // 2. Register Seeker
        const seekerEmail = `seeker_${randomString()}@test.com`;
        const seekerPassword = 'password123';
        res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: seekerEmail, password: seekerPassword, name: 'Test Seeker', role: 'job-seeker' })
        });
        assert(res.ok, 'Register Seeker');

        // 3. Login Recruiter
        res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recruiterEmail, password: recruiterPassword })
        });
        assert(res.ok, 'Login Recruiter');
        const recruiterCookie = res.headers.get('set-cookie') || '';

        // 4. Login Seeker
        res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: seekerEmail, password: seekerPassword })
        });
        assert(res.ok, 'Login Seeker');
        const seekerCookie = res.headers.get('set-cookie') || '';

        // 5. Login Invalid Password
        res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recruiterEmail, password: 'wrongpassword' })
        });
        assert(!res.ok && res.status === 401, 'Login Invalid Password (should fail)');

        // --- COMPANY ---
        console.log('\n--- Company ---');

        // 6. Create Company
        res = await fetch(`${BASE_URL}/api/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({
                name: `Test Company ${randomString()}`,
                description: 'A test company',
                coordinates: { latitude: 40.7128, longitude: -74.0060 },
                address: { city: 'New York', country: 'US' }
            })
        });
        assert(res.ok, 'Create Company');
        const companyData = await res.json();
        const companyId = companyData.company?._id;

        // 7. Create Duplicate Company
        res = await fetch(`${BASE_URL}/api/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({
                name: `Another Company`,
                description: 'Should fail',
                coordinates: { latitude: 0, longitude: 0 }
            })
        });
        assert(!res.ok && res.status === 400, 'Create Duplicate Company (should fail)');

        // 8. Get Company
        res = await fetch(`${BASE_URL}/api/company`, {
            headers: { 'Cookie': recruiterCookie }
        });
        assert(res.ok, 'Get Company');

        // 9. Update Company
        const newCompanyName = `Updated Company ${randomString()}`;
        res = await fetch(`${BASE_URL}/api/company`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({ name: newCompanyName, coordinates: { latitude: 40.7128, longitude: -74.0060 } })
        });
        assert(res.ok, 'Update Company');
        const updatedCompany = await res.json();
        assert(updatedCompany.company.name === newCompanyName, 'Verify Company Update');

        // 10. Update Company Validation (Missing coords)
        // Note: PUT requires coordinates if they are being updated, but if omitted they might be ignored? 
        // The code says: if (coordinates === undefined || coordinates === null || !coordinates.latitude ...) return 400
        // Wait, looking at code: 
        // if (coordinates === undefined || coordinates === null || !coordinates.latitude || !coordinates.longitude)
        // This logic seems to imply coordinates are ALWAYS required on PUT? Or only if provided?
        // "if (coordinates === undefined ...)" -> This checks if the argument itself is undefined.
        // Actually the code: `const { ... coordinates ... } = await request.json();`
        // If I send JSON without coordinates, `coordinates` is undefined.
        // The check `if (coordinates === undefined ...)` will be true.
        // So it seems coordinates ARE required on every PUT? Let's test this hypothesis.
        res = await fetch(`${BASE_URL}/api/company`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({ name: 'Should Fail Coords' }) // No coordinates
        });
        // If the API requires coords on PUT, this should fail.
        // If it allows partial updates without coords, it passes.
        // Based on my reading of `app/api/company/route.ts`:
        // `if (coordinates === undefined || coordinates === null || !coordinates.latitude || !coordinates.longitude)`
        // This condition is TRUE if coordinates is undefined. So it returns 400.
        assert(!res.ok && res.status === 400, 'Update Company without Coordinates (should fail)');


        // --- JOBS ---
        console.log('\n--- Jobs ---');

        // 11. Post Job
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
        assert(res.ok, 'Post Job');
        const jobData = await res.json();
        const jobId = jobData.job?._id;

        // 12. Post Job Missing Fields
        res = await fetch(`${BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
            body: JSON.stringify({ title: 'Missing Fields' })
        });
        assert(!res.ok && res.status === 400, 'Post Job Missing Fields (should fail)');

        // 13. Get All Jobs
        res = await fetch(`${BASE_URL}/api/jobs`);
        assert(res.ok, 'Get All Jobs');

        // 14. Get Single Job
        if (jobId) {
            res = await fetch(`${BASE_URL}/api/jobs/${jobId}`);
            assert(res.ok, 'Get Single Job');
        } else {
            console.error('❌ FAIL: Skipped Get Single Job (No Job ID)');
            failed++;
        }

        // 15. Edit Job
        if (jobId) {
            const newTitle = `Updated Job ${randomString()}`;
            res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Cookie': recruiterCookie },
                body: JSON.stringify({ title: newTitle })
            });
            assert(res.ok, 'Edit Job');
            const updatedJob = await res.json();
            assert(updatedJob.job.title === newTitle, 'Verify Job Update');
        }

        // 16. Edit Job Authorization (Seeker tries)
        if (jobId) {
            res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Cookie': seekerCookie },
                body: JSON.stringify({ title: 'Hacked Title' })
            });
            assert(!res.ok && (res.status === 403 || res.status === 401), 'Edit Job as Seeker (should fail)');
        }

        // 17. Delete Job
        if (jobId) {
            res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Cookie': recruiterCookie }
            });
            assert(res.ok, 'Delete Job');
        }

        // 18. Get Deleted Job
        if (jobId) {
            res = await fetch(`${BASE_URL}/api/jobs/${jobId}`);
            assert(!res.ok && res.status === 404, 'Get Deleted Job (should fail)');
        }

        // --- CV ---
        console.log('\n--- CV ---');

        // 19. Create CV
        res = await fetch(`${BASE_URL}/api/cv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': seekerCookie },
            body: JSON.stringify({
                fullName: 'Test Seeker',
                email: seekerEmail,
                summary: 'Summary',
                skills: ['Skill1']
            })
        });
        assert(res.ok, 'Create CV');

        // 20. Create Duplicate CV
        res = await fetch(`${BASE_URL}/api/cv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': seekerCookie },
            body: JSON.stringify({ fullName: 'Duplicate', email: 'dup@test.com' })
        });
        assert(!res.ok && res.status === 400, 'Create Duplicate CV (should fail)');

        // 21. Get CV
        res = await fetch(`${BASE_URL}/api/cv`, {
            headers: { 'Cookie': seekerCookie }
        });
        assert(res.ok, 'Get CV');

        // 22. Update CV
        res = await fetch(`${BASE_URL}/api/cv`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': seekerCookie },
            body: JSON.stringify({ summary: 'Updated Summary' })
        });
        assert(res.ok, 'Update CV');

        // 23. Update CV Partial (Add Skill)
        res = await fetch(`${BASE_URL}/api/cv`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': seekerCookie },
            body: JSON.stringify({ skills: ['Skill1', 'Skill2'] })
        });
        assert(res.ok, 'Update CV Partial');

        // 24. Delete CV
        res = await fetch(`${BASE_URL}/api/cv`, {
            method: 'DELETE',
            headers: { 'Cookie': seekerCookie }
        });
        assert(res.ok, 'Delete CV');

        // 25. Get Deleted CV
        res = await fetch(`${BASE_URL}/api/cv`, {
            headers: { 'Cookie': seekerCookie }
        });
        assert(!res.ok && res.status === 404, 'Get Deleted CV (should fail)');

    } catch (error) {
        console.error('Unexpected error:', error);
        failed++;
    }

    console.log(`\n--- Summary ---`);
    console.log(`Total Tests: 25`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) process.exit(1);
}

runExtendedVerification();

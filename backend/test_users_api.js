const BASE_URL = 'http://localhost:5000/api/users';

async function post(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

async function testAPIs() {
  console.log('Testing User Creation APIs...');
  
  let facultyId = null;

  try {
    // 1. Test Admin
    console.log('\n--- Creating Admin ---');
    const adminRes = await post(`${BASE_URL}/admin`, {
      name: 'Super Admin Test',
      email: 'admin_test@university.edu',
      password: 'SecurePassword123'
    });
    console.log('Success:', adminRes);
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }

  try {
    // 2. Test Faculty
    console.log('\n--- Creating Faculty ---');
    const facRes = await post(`${BASE_URL}/faculty`, {
      name: 'Prof. John Doe Test',
      email: 'johndoe_test@university.edu',
      password: 'SecurePassword123',
      employeeId: 'EMP-FAC-001-TEST'
    });
    console.log('Success:', facRes);
    facultyId = facRes.user.id;
  } catch (error) {
    console.error('Error creating faculty:', error.message);
  }

  try {
    // 3. Test HOD
    console.log('\n--- Creating HOD ---');
    const hodRes = await post(`${BASE_URL}/hod`, {
      name: 'Dr. Sarah Smith Test',
      email: 'sarah.smith_test@university.edu',
      password: 'SecurePassword123',
      employeeId: 'EMP-HOD-099-TEST'
    });
    console.log('Success:', hodRes);
  } catch (error) {
    console.error('Error creating HOD:', error.message);
  }

  try {
    // 4. Test Student
    console.log('\n--- Creating Student ---');
    if (!facultyId) {
       console.log('Skipping Student creation because Faculty ID is missing (previous step failed or already exists).');
    } else {
      const studentRes = await post(`${BASE_URL}/student`, {
        name: 'Alice Johnson Test',
        email: 'alice.johnson_test@student.university.edu',
        password: 'SecurePassword123',
        rollNumber: '2024CS001-TEST',
        year: 2,
        batch: 'A',
        advisorId: facultyId
      });
      console.log('Success:', studentRes);
    }
  } catch (error) {
    console.error('Error creating student:', error.message);
  }
}

testAPIs();

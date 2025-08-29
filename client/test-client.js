import axios from 'axios';

const USER_SERVICE = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
const TASK_SERVICE = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;

// Set axios defaults
axios.defaults.withCredentials = true;

const testClientIntegration = async () => {
  console.log('🧪 Testing Client Integration...\n');

  try {
    // Test User Service Connection
    console.log('1. Testing User Service Connection...');
    const userHealth = await axios.get(`${USER_SERVICE.replace('/api/v1', '')}/health`);
    console.log('✅ User Service Health:', userHealth.data);

    // Test Task Service Connection
    console.log('\n2. Testing Task Service Connection...');
    const taskHealth = await axios.get(`${TASK_SERVICE.replace('/api/v1', '')}/health`);
    console.log('✅ Task Service Health:', taskHealth.data);

    // Test User Registration/Login Flow
    console.log('\n3. Testing Authentication Flow...');
    const testUser = {
      name: 'Client Test User',
      email: 'clienttest@example.com',
      password: 'password123'
    };

    let authCookie = null;

    try {
      // Try registration
      const registerResponse = await axios.post(`${USER_SERVICE}/register`, testUser);
      console.log('✅ User Registration successful');
      authCookie = registerResponse.headers['set-cookie']?.[0];
    } catch (regError) {
      if (regError.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ User exists, trying login...');
        
        // Try login
        const loginResponse = await axios.post(`${USER_SERVICE}/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ User Login successful');
        authCookie = loginResponse.headers['set-cookie']?.[0];
      } else {
        throw regError;
      }
    }

    if (authCookie) {
      // Test Get User
      console.log('\n4. Testing Get User...');
      const userResponse = await axios.get(`${USER_SERVICE}/user`, {
        headers: { Cookie: authCookie }
      });
      console.log('✅ Get User successful:', userResponse.data.name);

      // Test Task Operations
      console.log('\n5. Testing Task Operations...');
      
      // Create Task
      const testTask = {
        title: 'Client Test Task',
        description: 'This is a test task from client',
        priority: 'high',
        status: 'active'
      };

      const createTaskResponse = await axios.post(`${TASK_SERVICE}/task/create`, testTask, {
        headers: { Cookie: authCookie }
      });
      console.log('✅ Task Creation successful:', createTaskResponse.data.title);

      const taskId = createTaskResponse.data._id;

      // Get Tasks
      const tasksResponse = await axios.get(`${TASK_SERVICE}/tasks`, {
        headers: { Cookie: authCookie }
      });
      console.log('✅ Get Tasks successful:', `${tasksResponse.data.length} tasks found`);

      // Update Task
      const updateTaskResponse = await axios.patch(`${TASK_SERVICE}/task/${taskId}`, {
        title: 'Updated Client Test Task',
        completed: true
      }, {
        headers: { Cookie: authCookie }
      });
      console.log('✅ Task Update successful:', updateTaskResponse.data.title);

      // Delete Task
      await axios.delete(`${TASK_SERVICE}/task/${taskId}`, {
        headers: { Cookie: authCookie }
      });
      console.log('✅ Task Deletion successful');

      console.log('\n🎉 All client integration tests passed!');
    } else {
      console.log('❌ No authentication cookie received');
    }

  } catch (error) {
    console.error('\n❌ Client integration test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure both services are running:');
    console.log('   - User Service: http://localhost:8001');
    console.log('   - Task Service: http://localhost:8002');
    console.log('   - Client: http://localhost:3000');
  }
};

// Run tests
testClientIntegration();
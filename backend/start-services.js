import { spawn } from 'child_process';
import path from 'path';

const startService = (serviceName, port) => {
  const servicePath = path.join(process.cwd(), serviceName);
  
  console.log(`Starting ${serviceName} on port ${port}...`);
  
  const service = spawn('npm', ['start'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true
  });

  service.on('error', (error) => {
    console.error(`Error starting ${serviceName}:`, error);
  });

  service.on('close', (code) => {
    console.log(`${serviceName} exited with code ${code}`);
  });

  return service;
};

// Start both services
const userService = startService('user_service', 8001);
const taskService = startService('task_service', 8002);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down services...');
  userService.kill();
  taskService.kill();
  process.exit(0);
});

console.log('Both services started. Press Ctrl+C to stop.');
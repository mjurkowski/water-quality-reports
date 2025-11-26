#!/usr/bin/env node

import { authService } from '../services/authService';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  try {
    console.log('\n=== Create Admin User ===\n');

    const email = await question('Email: ');
    if (!email || !email.includes('@')) {
      console.error('Error: Invalid email address');
      process.exit(1);
    }

    const name = await question('Name (optional): ');

    const password = await question('Password (min 8 characters): ');
    if (!password || password.length < 8) {
      console.error('Error: Password must be at least 8 characters');
      process.exit(1);
    }

    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.error('Error: Passwords do not match');
      process.exit(1);
    }

    const role = await question('Role (default: admin): ');

    console.log('\nCreating admin user...');

    const adminUser = await authService.createAdminUser(
      email,
      password,
      name || undefined,
      role || 'admin'
    );

    console.log('\n✓ Admin user created successfully!\n');
    console.log('Details:');
    console.log(`  ID: ${adminUser.id}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Name: ${adminUser.name || '(not set)'}`);
    console.log(`  Role: ${adminUser.role}`);
    console.log(`  Created: ${adminUser.createdAt}\n`);

    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}\n`);
    } else {
      console.error('\nUnknown error occurred\n');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();

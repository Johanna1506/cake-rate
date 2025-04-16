import { execSync } from 'child_process';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

function runCommand(command: string) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error('Error running command:', error);
        process.exit(1);
    }
}

function createMigration(name: string) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const migrationName = `${timestamp}_${name}.sql`;
    const migrationPath = join(MIGRATIONS_DIR, migrationName);
    
    // Create empty migration file
    execSync(`touch ${migrationPath}`);
    console.log(`Created migration: ${migrationName}`);
}

function applyMigrations() {
    console.log('Applying migrations...');
    runCommand('supabase db push');
}

function resetDatabase() {
    console.log('Resetting database...');
    runCommand('supabase db reset');
}

// Handle command line arguments
const command = process.argv[2];
const name = process.argv[3];

switch (command) {
    case 'create':
        if (!name) {
            console.error('Please provide a migration name');
            process.exit(1);
        }
        createMigration(name);
        break;
    case 'apply':
        applyMigrations();
        break;
    case 'reset':
        resetDatabase();
        break;
    default:
        console.log(`
Usage:
  npm run migrate create <name>  # Create a new migration
  npm run migrate apply          # Apply all pending migrations
  npm run migrate reset          # Reset the database and apply all migrations
        `);
} 
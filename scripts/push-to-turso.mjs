import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function main() {
    try {
        const sqlPath = path.join(process.cwd(), 'migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Pushing schema to Turso...');

        await client.executeMultiple(sql);

        console.log('Schema pushed successfully!');
    } catch (e) {
        console.error('Error pushing schema:', e);
        process.exit(1);
    } finally {
        client.close();
    }
}

main();

import { prisma } from '../src/lib/prisma'

async function main() {
    console.log('Testing DB connection...');
    try {
        const users = await prisma.user.findMany();
        console.log('Successfully connected! Found users:', users.length);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

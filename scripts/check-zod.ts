import { z } from 'zod';

const schema = z.object({
    name: z.string(),
});

const result = schema.safeParse({ name: 123 });

if (!result.success) {
    console.log('Error keys:', Object.keys(result.error));
    console.log('Error prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(result.error)));
    // @ts-ignore
    if (result.error.errors) console.log('Has errors property');
    // @ts-ignore
    if (result.error.issues) console.log('Has issues property');
}

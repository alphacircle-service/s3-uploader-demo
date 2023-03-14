import { randomUUID } from 'crypto';

export const createRandomFileKey = (): string => randomUUID().replace(/-/g, '');

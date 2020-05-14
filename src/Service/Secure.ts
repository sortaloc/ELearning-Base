import { Request, Response } from 'express';
const SecureController = require('@Controllers/SecureController');

module.exports = (router: any) => {

    router.post('/createUserPin', async (req: Request, res: Response) => {
        // Simple Hashing
        // Create IDCustomer
        // Create PIN
        // Generate Secret JWT
    })

    return router;
}
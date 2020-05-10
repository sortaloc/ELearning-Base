import { Request, Response } from 'express';

module.exports = (router: any) => {
    router.use('/', (req: Request, res: Response) => {
        res.send(true)
    })

    return router;
}
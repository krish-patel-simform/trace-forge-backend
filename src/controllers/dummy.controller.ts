import type { Request, Response } from 'express';

export function dummyController(req: Request, res: Response) {
  return res.status(200).json({ message: 'Server is running fine' });
}

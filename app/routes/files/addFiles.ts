import type { Request, Response } from 'express';

const addFiles = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('in function');
    console.log(req.url);

    return res.status(200).json({ message: 'files' });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Error adding files',
      error: err.message,
    });
  }
};

export default addFiles;
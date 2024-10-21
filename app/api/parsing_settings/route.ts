import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'utils', 'parsing_settings.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const newSettings = req.body;

        fs.writeFile(settingsFilePath, JSON.stringify(newSettings, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to update settings', error: err.message });
            }
            res.status(200).json({ message: 'Settings updated successfully' });
        });
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
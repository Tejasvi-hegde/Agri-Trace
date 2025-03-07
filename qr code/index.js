import express from 'express';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3050;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', async (req, res) => {
    try {
        const url = '192.168.64.172:3000/d12';
        const qrCodeData = await QRCode.toDataURL(url);
        console.log(`QR code generated for ${qrCodeData}`);
        res.send(`<img src="${qrCodeData}" alt="QR Code">`);
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send('Error generating QR code');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


import QRCode from 'qrcode';
import fs from 'fs';

const generateQRCode = async (data, filePath) => {
    try {
        await QRCode.toFile(filePath, data);
        console.log(`QR code generated for ${data} at ${filePath}`);
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
};

const generateMultipleQRCodes = async (numberOfQRCodes) => {
    for (let i = 1; i <= numberOfQRCodes; i++) {
        const userId = `${i}`;
        console.log(`Generating QR code for user ${userId}`);
        const filePath = `./qrcodes/${userId}.png`;
        await generateQRCode(`192.168.64.172:3000/${userId}`, filePath);
    }
};

// Create the directory if it doesn't exist
if (!fs.existsSync('./qrcodes')) {
    fs.mkdirSync('./qrcodes');
}

// Generate 1000 QR codes for demonstration, adjust as needed
generateMultipleQRCodes(3);

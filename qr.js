document.getElementById('qrForm').addEventListener('submit', (event) => {
    event.preventDefault();

    try {
        const url = document.getElementById('url').value;
        const mainQRPosition = document.getElementById('mainQRPosition').value;

        const qrCodes = generateQRCode(url);
        createCombinedImage(qrCodes, mainQRPosition - 1);
    } catch (error) {
        console.error(error);
    }
});

const generateRandomText = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const generateQRCode = (url) => {
    const mainQRCode = qrcode(0, 'L');
    mainQRCode.addData(url);
    mainQRCode.make();

    const mainQRImage = new Image();
    mainQRImage.src = mainQRCode.createDataURL(10, 0);

    const urlLength = url.length;
    const randomQRImageTags = Array.from({ length: 5 }, () => {
        const randomText = generateRandomText(urlLength);
        const randomQRCode = qrcode(0, 'L');
        randomQRCode.addData(randomText);
        randomQRCode.make();

        const randomQRImage = new Image();
        randomQRImage.src = randomQRCode.createDataURL(10, 0);
        return randomQRImage;
    });

    return [mainQRImage, ...randomQRImageTags];
};

const createCombinedImage = (qrImages, mainQRPosition) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rows = 2;
    const cols = 3;
    const blockSide = Math.min(canvas.width / cols, canvas.height / rows);

    let loadedImages = 0;

    const checkImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === qrImages.length) {
            drawImages();
        }
    };

    const drawImages = () => {
        const margin = 10;

        const [mainX, mainY] = getPositionCoordinates(mainQRPosition, blockSide);
        ctx.drawImage(qrImages[0], mainX + margin, mainY + margin, blockSide - 2 * margin, blockSide - 2 * margin);

        for (let i = 1; i < qrImages.length; i++) {
            const position = (mainQRPosition + i) % (rows * cols);
            const [x, y] = getPositionCoordinates(position, blockSide);
            ctx.drawImage(qrImages[i], x + margin, y + margin, blockSide - 2 * margin, blockSide - 2 * margin);
        }

        const combinedDataURL = canvas.toDataURL('image/png');
        const existingImage = document.getElementById('combinedImage');

        if (existingImage) {
            existingImage.src = combinedDataURL;
        } else {
            const combinedImage = new Image();
            combinedImage.id = 'combinedImage';
            combinedImage.src = combinedDataURL;
            document.getElementById('result').appendChild(combinedImage);
        }
    };

    qrImages.forEach((image) => {
        image.onload = checkImagesLoaded;
    });

    qrImages[0].src = qrImages[0].src;
    qrImages.slice(1).forEach((image) => {
        image.src = image.src;
    });
};

const getPositionCoordinates = (position, blockSide) => {
    const row = Math.floor(position / 3);
    const col = position % 3;
    const x = col * blockSide;
    const y = row * blockSide;
    return [x, y];
};

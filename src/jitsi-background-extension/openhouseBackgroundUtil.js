function storeImgInLocalStorage (imgUrl) {
    let storedImages = [];
    storedImages = JSON.parse(window.localStorage.getItem("virtualBackgrounds"));
    if (!storedImages) {
        storedImages=[];
    } else {
        for (let storedImg of storedImages) {
            if (storedImg.origin === imgUrl) {
                return;
            }
        }
    }
    imageToUri(imgUrl, function(dataUrl) {
        const uuId = uuidv4();
        storedImages.push(
            {
                id: uuId,
                src: dataUrl,
                origin: imgUrl
            });
            window.localStorage.setItem("virtualBackgrounds",JSON.stringify(storedImages));
    });
};

function imageToUri(url, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let base_image = new Image();
    base_image.setAttribute('crossOrigin', 'anonymous');
    base_image.onload = function() {
        canvas.width = base_image.width;
        canvas.height = base_image.height;
        ctx.drawImage(base_image, 0, 0);
        callback(canvas.toDataURL('image/png'));
        canvas.remove();
    }
    base_image.src = url;
};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

let openhouseBackgroundExtenstion = {storeImgInLocalStorage:storeImgInLocalStorage};

export default {openhouseBackgroundExtenstion};
const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


function loadImage(e) {
    const file = e.target.files[0];
    if (!isFileImage(file)) {
        alertMessage({ background: 'red' })
        return
    } else {
        alertMessage({ message: 'File is uploaded successfully', background: 'green' })
    }

    // Add current height and width to form using the URL API
    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = function () {
        widthInput.value = this.width
        heightInput.value = this.height
    }

    // Show form, image name and output path
    form.style.display = 'block';
    filename.innerText = file.name
    outputPath.innerText = path.join(os.homedir(), 'Pictures', 'Image Resizer')
}


function isFileImage(file) {
    const acceptedImageType = ['image/gif', 'image/jpeg', 'image/png']

    return file && acceptedImageType.includes(file.type)
}

function alertMessage({ message = 'Please selete gif, jpeg or png image', background }) {
    toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background,
            color: 'white',
            textAlign: 'center'
        }
    })
}

function handleResize(e) {
    e.preventDefault()

    const width = widthInput.value
    const height = heightInput.value
    const imgPath = img.files[0].path

    if (!img.files[0]) {
        alertMessage()
        return;
    }
    if (widthInput.value === '' || heightInput.value === '') {
        alertMessage({ message: 'Please set image width and height' })
        return;
    }
    // send img width and height size to main js
    window.ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height
    })
}

// image is resized successfully alertMessage
ipcRenderer.on('resize:done', () => {
    alertMessage({message: 'Image is resized successfully', background:'green'})
})

// file select listener
img.addEventListener('change', loadImage)
form.addEventListener('submit', handleResize)
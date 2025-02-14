function copyContract() {
  const contractAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  navigator.clipboard.writeText(contractAddress).then(() => {
    const notification = document.getElementById('copyNotification');
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  });
}
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('memeModal');
  const createBtn = document.querySelector('.create-meme-btn');
  const closeBtn = document.querySelector('.close-btn');
  const canvas = document.getElementById('memeCanvas');
  const ctx = canvas.getContext('2d');
  const imageUpload = document.getElementById('imageUpload');
  const rotationControl = document.getElementById('rotationControl');
  const scaleControl = document.getElementById('scaleControl');
  const downloadBtn = document.querySelector('.download-btn');
  
  let uploadedImage = null;
  let position = { x: 0, y: 0 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  
  // Set canvas size to 1000x1000 for high quality output
  canvas.width = 1000;
  canvas.height = 1000;
  
  createBtn.addEventListener('click', () => {
    modal.classList.add('show');
  });
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
  });
  
imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    // Create object URL instead of data URL
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      uploadedImage = img;
      position = { x: 0, y: 0 };
      const minScale = Math.max(canvas.width / img.width, canvas.height / img.height);
      scaleControl.value = minScale;
      rotationControl.value = 0;
      drawMeme();
      URL.revokeObjectURL(objectUrl); // Clean up
    };
    img.src = objectUrl;
  }
});
  
function calculateImageDimensions(image, canvasSize) {
  const maxSize = canvasSize;
  let width = image.width;
  let height = image.height;
  
  // Calculate scale factors for both dimensions
  const scaleX = maxSize / width;
  const scaleY = maxSize / height;
  
  // Use the larger scale factor to ensure image fills the canvas
  const scale = Math.max(scaleX, scaleY);
  
  // Apply scaling
  width *= scale;
  height *= scale;
  
  return { width, height };
}
  
// When loading the overlay image, add crossOrigin attribute
function drawMeme() {
  if (!uploadedImage) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(rotationControl.value * Math.PI / 180);
  ctx.scale(scaleControl.value, scaleControl.value);
  
  const uploadedDimensions = calculateImageDimensions(uploadedImage, canvas.width);
  
  ctx.filter = 'blur(50px)';
  try {
    ctx.drawImage(
      uploadedImage,
      -uploadedDimensions.width/2 + position.x,
      -uploadedDimensions.height/2 + position.y,
      uploadedDimensions.width,
      uploadedDimensions.height
    );
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(
      -uploadedDimensions.width/2 + position.x,
      -uploadedDimensions.height/2 + position.y,
      uploadedDimensions.width,
      uploadedDimensions.height
    );
  } catch (error) {
    console.error('Error drawing image:', error);
  }
  
  ctx.restore();
  
  const overlayImage = new Image();
  overlayImage.crossOrigin = "anonymous";  // Add this line
  overlayImage.onload = () => {
    const overlayDimensions = calculateImageDimensions(overlayImage, canvas.width);
    ctx.drawImage(
      overlayImage,
      (canvas.width - overlayDimensions.width) / 2,
      (canvas.height - overlayDimensions.height) / 2,
      overlayDimensions.width,
      overlayDimensions.height
    );
  };
  overlayImage.src = 'https://i.ibb.co/83FmfHD/Sensitive-content-14.png';
}

downloadBtn.addEventListener('click', async () => {
  if (!uploadedImage) {
    alert('Please upload an image first');
    return;
  }

  try {
    console.log('Starting overlay image load...');
    const overlayImage = new Image();
    overlayImage.crossOrigin = "anonymous";  // Add this line
    
    await new Promise((resolve, reject) => {
      overlayImage.onload = resolve;
      overlayImage.onerror = reject;
      overlayImage.src = 'https://i.ibb.co/83FmfHD/Sensitive-content-14.png';
    });

    // Rest of your download code...
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(rotationControl.value * Math.PI / 180);
    ctx.scale(scaleControl.value, scaleControl.value);
    
    const uploadedDimensions = calculateImageDimensions(uploadedImage, canvas.width);
    
    ctx.filter = 'blur(50px)';
    ctx.drawImage(
      uploadedImage,
      -uploadedDimensions.width/2 + position.x,
      -uploadedDimensions.height/2 + position.y,
      uploadedDimensions.width,
      uploadedDimensions.height
    );
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(
      -uploadedDimensions.width/2 + position.x,
      -uploadedDimensions.height/2 + position.y,
      uploadedDimensions.width,
      uploadedDimensions.height
    );
    
    ctx.restore();
    
    const overlayDimensions = calculateImageDimensions(overlayImage, canvas.width);
    ctx.drawImage(
      overlayImage,
      (canvas.width - overlayDimensions.width) / 2,
      (canvas.height - overlayDimensions.height) / 2,
      overlayDimensions.width,
      overlayDimensions.height
    );

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Blob creation failed'));
      }, 'image/png');
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sensitive-content-meme.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Sorry, download failed. Try taking a screenshot instead.');
  }
});

const shareTwitterBtn = document.querySelector('.share-twitter-btn');
shareTwitterBtn.addEventListener('click', () => {
  const tweetText = encodeURIComponent('🚫 Created with @SensitiveContentDog\n\n#SensitiveContent $SENSE');
  window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
});
// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  dragStart = {
    x: (e.clientX - rect.left) * scaleX - position.x,
    y: (e.clientY - rect.top) * scaleY - position.y
  };
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    position = {
      x: (e.clientX - rect.left) * scaleX - dragStart.x,
      y: (e.clientY - rect.top) * scaleY - dragStart.y
    };
    drawMeme();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
});

rotationControl.addEventListener('input', drawMeme);
scaleControl.addEventListener('input', drawMeme);
});
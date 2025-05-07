let images = [];
let currentImageIndex = 0;
const foregroundImage = document.querySelector('.foreground-image');

function updateImage() {
  foregroundImage.src = images[currentImageIndex];
}

function updateBlur(value) {
  const styleSheet = document.styleSheets[0];
  const effect = document.getElementById('blurEffect').value;
  let filterValue;
  
  switch(effect) {
    case 'blur-bright':
      filterValue = `blur(${value}px) brightness(120%)`;
      break;
    case 'blur-contrast':
      filterValue = `blur(${value}px) contrast(120%)`;
      break;
    case 'blur-saturate':
      filterValue = `blur(${value}px) saturate(120%)`;
      break;
    default:
      filterValue = `blur(${value}px)`;
  }

  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (styleSheet.cssRules[i].selectorText === 'body::before') {
      const rule = styleSheet.cssRules[i];
      rule.style.filter = filterValue;
      break;
    }
  }
}

function getCurrentBackgroundImage() {
  const rules = document.styleSheets[0].cssRules;
  for (let rule of rules) {
    if (rule.selectorText === 'body::before') {
      const bgImage = rule.style.backgroundImage;
      const urls = bgImage.match(/url\(['"]?(.*?)['"]?\)/g);
      if (urls && urls.length > 0) {
        return urls[urls.length - 1].match(/url\(['"]?(.*?)['"]?\)/)[1];
      }
    }
  }
  return '';
}

let lastTap = 0;
const DOUBLE_TAP_DELAY = 300; // milliseconds

function toggleMenu() {
  const menu = document.querySelector('.menu-container');
  menu.style.display = menu.style.display === 'none' ? 'grid' : 'none';
}

// Event Listeners
document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowRight') {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateImage();
  } else if (event.key === 'ArrowLeft') {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateImage();
  } else if (event.code === 'Space') {
    event.preventDefault();
    toggleMenu();
  }
});

// Add touch event handlers
document.addEventListener('touchend', function(event) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  
  if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
    event.preventDefault();
    toggleMenu();
  }
  lastTap = currentTime;
});

// Initialize all event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Prevent default double-tap zoom on mobile
  document.addEventListener('dblclick', function(e) {
    e.preventDefault();
  });
  
  document.getElementById('chooseBgButton').addEventListener('click', function() {
    document.getElementById('bgImageInput').click();
  });

  document.getElementById('chooseFgButton').addEventListener('click', function() {
    document.getElementById('fgImageInput').click();
  });

  document.getElementById('bgImageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        // Update the ::before pseudo-element
        const styleSheet = document.styleSheets[0];
        let ruleIndex = -1;
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
          if (styleSheet.cssRules[i].selectorText === 'body::before') {
            ruleIndex = i;
            break;
          }
        }

        if (ruleIndex !== -1) {
          styleSheet.deleteRule(ruleIndex);
        }

        styleSheet.insertRule(`body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-size: 100vw 100vh;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          z-index: -1;
          background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${imageUrl}");
          filter: blur(5px);
          transform: scale(1.1);
        }`, styleSheet.cssRules.length);

        // Remove these two lines that were hiding the elements
        // document.getElementById('bgImageInput').style.display = 'none';
        // document.getElementById('chooseBgButton').style.display = 'none';
      }
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('fgImageInput').addEventListener('change', function(event) {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
    );

    // Process each image file
    for (const file of imageFiles) {
      const reader = new FileReader();
      reader.onload = function(e) {
        foregroundImage.src = e.target.result;
        images.push(e.target.result);
      }
      reader.readAsDataURL(file);
    }
  });

  // Blur slider
  const blurSlider = document.querySelector('.blur-slider');
  blurSlider.addEventListener('input', function(event) {
    updateBlur(event.target.value);
  });

  // Blur effect select
  document.getElementById('blurEffect').addEventListener('change', function() {
    updateBlur(document.querySelector('.blur-slider').value);
  });

  // Opacity slider
  const opacitySlider = document.querySelector('.opacity-slider');
  opacitySlider.addEventListener('input', function(event) {
    const opacity = event.target.value / 100;
    const styleSheet = document.styleSheets[0];
    
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
      if (styleSheet.cssRules[i].selectorText === 'body::before') {
        const rule = styleSheet.cssRules[i];
        const bgImage = getCurrentBackgroundImage();
        rule.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity})), url("${bgImage}")`;
      }
    }
  });

  // Size slider
  const sizeSlider = document.querySelector('.size-slider');
  sizeSlider.addEventListener('input', function(event) {
    const size = parseInt(event.target.value);
    const img = document.querySelector('.foreground-image');
    
    if (img.src) {
      if (window.innerWidth <= 600) {
        const maxWidth = Math.min(size, window.innerWidth * 0.85);
        img.style.width = `${maxWidth}px`;
        img.style.height = 'auto';
      } else {
        img.style.height = `${size}px`;
        img.style.width = 'auto';
      }
    }
  });

  // Add drag and drop handlers
  foregroundImage.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', event.target.src);
  });

  document.body.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  document.body.addEventListener('drop', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    
    // Filter for image files
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
    );

    // Process each image file
    for (const file of imageFiles) {
      const reader = new FileReader();
      reader.onload = function(e) {
        foregroundImage.src = e.target.result;
        images.push(e.target.result);
      }
      reader.readAsDataURL(file);
    }
  });
});

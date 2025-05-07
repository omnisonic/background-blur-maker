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
    const menu = document.querySelector('.menu-container');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }
});

// Initialize all event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
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
          top: -10%;
          left: -10%;
          width: 120%;
          height: 120%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          z-index: -1;
          background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${imageUrl}");
          filter: blur(5px);
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
    const size = event.target.value;
    document.querySelector('.foreground-image').height = size;
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

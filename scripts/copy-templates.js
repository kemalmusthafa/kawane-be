const fs = require('fs');
const path = require('path');

// Copy templates directory
function copyTemplates() {
  const srcDir = 'src/templates';
  const destDir = 'dist/templates';
  
  try {
    if (!fs.existsSync(srcDir)) {
      console.log('⚠️  Templates directory not found, skipping...');
      return;
    }
    
    // Create destination directory
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy files
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      
      if (fs.statSync(srcFile).isDirectory()) {
        // Copy directory recursively
        copyDir(srcFile, destFile);
      } else {
        // Copy file
        fs.copyFileSync(srcFile, destFile);
        console.log(`✅ Copied: ${file}`);
      }
    });
    
    console.log('✅ Templates copied successfully!');
  } catch (error) {
    console.error('❌ Error copying templates:', error.message);
    process.exit(1);
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// Run copy
copyTemplates();



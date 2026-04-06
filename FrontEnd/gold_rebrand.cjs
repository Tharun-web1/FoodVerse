const fs = require('fs');
const path = require('path');

const directories = [
  'c:/Users/Sreekanth/Desktop/intern_project_complete/intern_project_complete/food-app-comp/src/components/RestaurantCss',
  'c:/Users/Sreekanth/Desktop/intern_project_complete/intern_project_complete/food-app-comp/src/components/UserCss'
];

const replacements = [
  { from: /#fc8019|#ff8a3d|#e78012|#e67000|#ff7b00|#ff9800|#ff8c00/gi, to: '#D4AF37' },
  { from: /252, 128, 25/g, to: '212, 175, 55' },
  { from: /255, 138, 61/g, to: '212, 175, 55' }
];

console.log('Starting rebranding...');

directories.forEach(dir => {
  console.log(`Checking directory: ${dir}`);
  if (!fs.existsSync(dir)) {
    console.log(`Directory does NOT exist: ${dir}`);
    return;
  }
  const files = fs.readdirSync(dir);
  console.log(`Found ${files.length} files in ${path.basename(dir)}`);
  
  files.forEach(file => {
    if (file.endsWith('.css')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;

      replacements.forEach(r => {
        content = content.replace(r.from, r.to);
      });

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`  Updated: ${file}`);
      }
    }
  });
});
console.log('Rebranding complete.');

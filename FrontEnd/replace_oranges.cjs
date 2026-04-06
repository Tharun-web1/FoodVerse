const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Sreekanth/Desktop/intern_project_complete/intern_project_complete/food-app-comp/src/components/UserCss';
const oranges = /#fc8019|#e78012|#e67000|#e67817|#ff7b00|#ff9800|#ff8c00/gi;

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.css')) {
        const p = path.join(dir, file);
        const orig = fs.readFileSync(p, 'utf8');
        const updated = orig.replace(oranges, '#D4AF37');
        if (orig !== updated) {
            fs.writeFileSync(p, updated);
            console.log('Updated ' + file);
        }
    }
});

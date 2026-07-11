// Icon Generator Script for Browser Storage Explorer
// Run this script to generate the required icon PNG files
// Usage: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Check if canvas is available
let createCanvas;
try {
    const canvas = require('canvas');
    createCanvas = canvas.createCanvas;
    console.log('✓ Using canvas library for icon generation\n');
} catch (error) {
    console.log('⚠ Canvas library not found. Installing...\n');
    const { execSync } = require('child_process');
    try {
        execSync('npm install canvas', { stdio: 'inherit', cwd: __dirname });
        const canvas = require('canvas');
        createCanvas = canvas.createCanvas;
        console.log('✓ Canvas library installed successfully\n');
    } catch (installError) {
        console.log('❌ Failed to install canvas library.');
        console.log('Please install it manually: npm install canvas');
        console.log('\nAlternatively, you can:');
        console.log('1. Open icons/icon-generator.html in a browser');
        console.log('2. Download the icons manually');
        process.exit(1);
    }
}

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // Draw rounded rectangle background
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const radius = size * 0.2;
    if (ctx.roundRect) {
        ctx.roundRect(0, 0, size, size, radius);
    } else {
        // Fallback for older canvas versions
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
    }
    ctx.fill();
    
    // Draw storage icon (box with layers)
    ctx.fillStyle = 'white';
    const centerX = size / 2;
    const centerY = size / 2;
    const boxWidth = size * 0.6;
    const boxHeight = size * 0.5;
    const boxY = centerY - boxHeight / 2;
    
    // Draw main box
    ctx.fillRect(centerX - boxWidth / 2, boxY, boxWidth, boxHeight);
    
    // Draw top layer (3D effect)
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(centerX - boxWidth / 2, boxY);
    ctx.lineTo(centerX, boxY - size * 0.15);
    ctx.lineTo(centerX + boxWidth / 2, boxY);
    ctx.lineTo(centerX + boxWidth / 2, boxY + size * 0.1);
    ctx.lineTo(centerX, boxY + size * 0.1 - size * 0.15);
    ctx.lineTo(centerX - boxWidth / 2, boxY + size * 0.1);
    ctx.closePath();
    ctx.fill();
    
    // Draw side layer
    ctx.beginPath();
    ctx.moveTo(centerX + boxWidth / 2, boxY);
    ctx.lineTo(centerX + boxWidth / 2, boxY + boxHeight);
    ctx.lineTo(centerX, boxY + boxHeight - size * 0.15);
    ctx.lineTo(centerX, boxY - size * 0.15);
    ctx.closePath();
    ctx.fill();
    
    // Draw horizontal lines on box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = size * 0.02;
    for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX - boxWidth / 2 + size * 0.05, boxY + (boxHeight / 3) * i);
        ctx.lineTo(centerX + boxWidth / 2 - size * 0.05, boxY + (boxHeight / 3) * i);
        ctx.stroke();
    }
    
    return canvas;
}

function saveIcon(size) {
    const canvas = drawIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const iconsDir = path.join(__dirname, 'icons');
    
    // Create icons directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    const filename = `icon${size}.png`;
    const filepath = path.join(iconsDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Generated ${filename}`);
}

// Generate all required icons
console.log('Generating extension icons...\n');
[16, 48, 128].forEach(size => saveIcon(size));

console.log('\n✅ All icons generated successfully!');
console.log('Icons saved in: ' + path.join(__dirname, 'icons'));
console.log('\nYou can now load the extension in your browser.');
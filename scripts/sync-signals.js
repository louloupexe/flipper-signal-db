const fs = require('fs');
const path = require('path');

// Target paths
const signalsDir = path.join(__dirname, '../signals');
const outputFile = path.join(__dirname, '../signals_files.json');

try {
  console.log('🔄 Scanning signals directory...');
  
  if (!fs.existsSync(signalsDir)) {
    console.error(`❌ Error: Signals directory not found at: ${signalsDir}`);
    process.exit(1);
  }

  // Read signals/ directory
  const files = fs.readdirSync(signalsDir)
    .filter(file => file.toLowerCase().endsWith('.sub'))
    .sort();

  console.log(`📄 Found ${files.length} .sub file(s) in signals/.`);

  // Write list to signals_files.json
  fs.writeFileSync(outputFile, JSON.stringify(files, null, 2), 'utf8');
  
  console.log(`✅ Successfully generated/updated ${outputFile}`);
} catch (error) {
  console.error('❌ Error synchronizing signals:', error);
  process.exit(1);
}

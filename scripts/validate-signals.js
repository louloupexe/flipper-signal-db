const fs = require('fs');
const path = require('path');

// Target paths
const signalsDir = path.join(__dirname, '../signals');
const signalsJsonFile = path.join(__dirname, '../signals.json');
const signalsFilesManifest = path.join(__dirname, '../signals_files.json');

// Schema definitions
const REQUIRED_FIELDS = ['name', 'frequency', 'protocol', 'description', 'category', 'region', 'contributor', 'filename'];
const ALLOWED_CATEGORIES = ['garage_doors', 'car_keys', 'intercoms', 'weather_stations', 'custom', 'jamming'];
const ALLOWED_REGIONS = ['eu', 'us', 'global'];

let hasErrors = false;

function reportError(message) {
  console.error(`❌ ${message}`);
  hasErrors = true;
}

try {
  console.log('🔍 Starting signal validation...\n');

  // 1. Read and validate signals.json structure
  if (!fs.existsSync(signalsJsonFile)) {
    reportError('signals.json file is missing in the repository root.');
    process.exit(1);
  }

  let signals;
  try {
    const rawJson = fs.readFileSync(signalsJsonFile, 'utf8');
    signals = JSON.parse(rawJson);
  } catch (e) {
    reportError(`signals.json is not valid JSON: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(signals)) {
    reportError('signals.json must be a JSON array at the top level.');
    process.exit(1);
  }

  // 2. Read signals/ directory for actual .sub files
  if (!fs.existsSync(signalsDir)) {
    reportError('signals/ directory is missing.');
    process.exit(1);
  }

  const actualSubFiles = fs.readdirSync(signalsDir)
    .filter(file => file.toLowerCase().endsWith('.sub'))
    .sort();
  const actualSubFilesSet = new Set(actualSubFiles);

  // 3. Read and validate signals_files.json manifest
  if (!fs.existsSync(signalsFilesManifest)) {
    reportError('signals_files.json is missing. Please run "npm run sync-signals" to generate it.');
  } else {
    try {
      const manifestJson = fs.readFileSync(signalsFilesManifest, 'utf8');
      const manifestFiles = JSON.parse(manifestJson);
      
      if (!Array.isArray(manifestFiles)) {
        reportError('signals_files.json must be a JSON array of filenames.');
      } else {
        // Compare manifest file list with actual files in signals/
        const manifestFilesSet = new Set(manifestFiles);
        
        // Find if files in signals/ are not in manifest
        const missingFromManifest = actualSubFiles.filter(f => !manifestFilesSet.has(f));
        // Find if files in manifest do not exist in signals/
        const extraInManifest = manifestFiles.filter(f => !actualSubFilesSet.has(f));

        if (missingFromManifest.length > 0 || extraInManifest.length > 0) {
          reportError('signals_files.json is out of sync with the actual files in signals/.');
          if (missingFromManifest.length > 0) {
            console.log(`   Missing from manifest: ${JSON.stringify(missingFromManifest)}`);
          }
          if (extraInManifest.length > 0) {
            console.log(`   Extra in manifest: ${JSON.stringify(extraInManifest)}`);
          }
          console.log('👉 Please run "npm run sync-signals" to update signals_files.json.');
          hasErrors = true;
        }
      }
    } catch (e) {
      reportError(`signals_files.json could not be read or is invalid JSON: ${e.message}`);
      console.log('👉 Please run "npm run sync-signals" to recreate signals_files.json.');
      hasErrors = true;
    }
  }

  // 4. Validate entries in signals.json
  const declaredFilenames = new Set();
  const declaredNames = new Set();
  const duplicateFilenames = new Set();
  const duplicateNames = new Set();

  signals.forEach((entry, index) => {
    const label = entry.name || `entry #${index}`;

    // Check required fields and type
    REQUIRED_FIELDS.forEach(field => {
      const value = entry[field];
      if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
        reportError(`[${label}] Missing or empty required field: "${field}"`);
      } else if (typeof value !== 'string') {
        reportError(`[${label}] Field "${field}" must be a string (got ${typeof value})`);
      }
    });

    // Check category validity
    if (entry.category && !ALLOWED_CATEGORIES.includes(entry.category)) {
      reportError(`[${label}] Invalid category "${entry.category}" — must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
    }

    // Check region validity
    if (entry.region && !ALLOWED_REGIONS.includes(entry.region)) {
      reportError(`[${label}] Invalid region "${entry.region}" — must be one of: ${ALLOWED_REGIONS.join(', ')}`);
    }

    // Check that the referenced filename actually exists in signals/
    if (entry.filename) {
      if (!actualSubFilesSet.has(entry.filename)) {
        reportError(`[${label}] References filename "${entry.filename}" which does not exist in signals/`);
      }

      // Check for duplicates
      if (declaredFilenames.has(entry.filename)) {
        duplicateFilenames.add(entry.filename);
      } else {
        declaredFilenames.add(entry.filename);
      }
    }

    if (entry.name) {
      if (declaredNames.has(entry.name)) {
        duplicateNames.add(entry.name);
      } else {
        declaredNames.add(entry.name);
      }
    }
  });

  // Report duplicates
  if (duplicateFilenames.size > 0) {
    reportError(`Duplicate filenames found in signals.json: ${Array.from(duplicateFilenames).join(', ')}`);
  }
  if (duplicateNames.size > 0) {
    reportError(`Duplicate signal names found in signals.json: ${Array.from(duplicateNames).join(', ')}`);
  }

  // 5. Check for actual .sub files in signals/ that are missing from signals.json
  const missingFromMetadata = actualSubFiles.filter(file => !declaredFilenames.has(file));
  if (missingFromMetadata.length > 0) {
    reportError(`The following files in signals/ do not have a metadata entry in signals.json:\n   - ${missingFromMetadata.join('\n   - ')}`);
    console.log('👉 Please edit signals.json to add metadata for these files.');
  }

  // Final summary
  if (hasErrors) {
    console.log('\n❌ Signal validation failed. Please address the errors above.');
    process.exit(1);
  } else {
    console.log(`\n✅ Validation successful: All ${signals.length} signals in signals.json are valid and match the files in signals/.`);
    process.exit(0);
  }
} catch (error) {
  console.error('❌ An unexpected error occurred during validation:', error);
  process.exit(1);
}

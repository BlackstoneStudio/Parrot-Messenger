#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COVERAGE_THRESHOLD = 90; // Minimum coverage percentage
const SAMPLE_TEST_PATTERN = '--testPathPattern="(validation|utils)\\.spec\\.ts$"'; // Run only quick tests

// Function to run coverage on sample tests
function getQuickCoverage() {
  try {
    console.log('Running quick coverage check...');
    execSync(
      `npm test -- --coverage --silent --ci --coverageReporters=json-summary ${SAMPLE_TEST_PATTERN}`,
      { stdio: 'pipe' },
    );
    return true;
  } catch (error) {
    console.error('Coverage check failed:', error.message);
    return false;
  }
}

// Update badge function (same as before)
function updateBadge() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  const readmePath = path.join(process.cwd(), 'README.md');

  try {
    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const totalCoverage = coverageData.total;

    const metrics = ['lines', 'statements', 'functions', 'branches'];
    const coveragePercentages = metrics.map((metric) => totalCoverage[metric].pct);
    const averageCoverage = Math.floor(
      coveragePercentages.reduce((a, b) => a + b, 0) / coveragePercentages.length,
    );

    let color;
    if (averageCoverage >= 90) {
      color = 'brightgreen';
    } else if (averageCoverage >= 80) {
      color = 'green';
    } else if (averageCoverage >= 70) {
      color = 'yellow';
    } else if (averageCoverage >= 60) {
      color = 'orange';
    } else {
      color = 'red';
    }

    let readme = fs.readFileSync(readmePath, 'utf8');
    const badgeRegex =
      /<img alt="Code Coverage" src="https:\/\/img\.shields\.io\/badge\/coverage-\d+%25-\w+" \/>/;
    const newBadge = `<img alt="Code Coverage" src="https://img.shields.io/badge/coverage-${averageCoverage}%25-${color}" />`;

    if (badgeRegex.test(readme)) {
      readme = readme.replace(badgeRegex, newBadge);
      fs.writeFileSync(readmePath, readme);
      console.log(`✅ Updated coverage badge to ${averageCoverage}%`);

      if (averageCoverage < COVERAGE_THRESHOLD) {
        console.warn(
          `⚠️  Warning: Coverage ${averageCoverage}% is below threshold of ${COVERAGE_THRESHOLD}%`,
        );
      }
    }

    return averageCoverage;
  } catch (error) {
    console.error('Error updating badge:', error.message);
    return null;
  }
}

// Main execution
if (require.main === module) {
  // Check if full coverage was requested
  const fullCoverage = process.argv.includes('--full');

  if (fullCoverage) {
    console.log('Running full test coverage...');
    try {
      execSync('npm test -- --coverage --silent --ci --coverageReporters=json-summary', {
        stdio: 'pipe',
      });
    } catch (error) {
      console.error('Full coverage failed');
      process.exit(1);
    }
  } else {
    // Run quick coverage check
    getQuickCoverage();
  }

  // Update badge
  updateBadge();
}

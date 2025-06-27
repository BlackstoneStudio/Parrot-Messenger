const fs = require('fs');
const path = require('path');

// Read coverage summary
const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
const readmePath = path.join(process.cwd(), 'README.md');

try {
  // Read coverage data
  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const totalCoverage = coverageData.total;

  // Calculate average coverage
  const metrics = ['lines', 'statements', 'functions', 'branches'];
  const coveragePercentages = metrics.map((metric) => totalCoverage[metric].pct);
  const averageCoverage = Math.floor(
    coveragePercentages.reduce((a, b) => a + b, 0) / coveragePercentages.length,
  );

  // Determine badge color
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

  // Read README
  let readme = fs.readFileSync(readmePath, 'utf8');

  // Update coverage badge
  const badgeRegex =
    /<img alt="Code Coverage" src="https:\/\/img\.shields\.io\/badge\/coverage-\d+%25-\w+" \/>/;
  const newBadge = `<img alt="Code Coverage" src="https://img.shields.io/badge/coverage-${averageCoverage}%25-${color}" />`;

  if (badgeRegex.test(readme)) {
    readme = readme.replace(badgeRegex, newBadge);
    fs.writeFileSync(readmePath, readme);
    console.log(`✅ Updated coverage badge to ${averageCoverage}%`);
  } else {
    console.log('⚠️  Coverage badge not found in README.md');
  }

  // Print detailed coverage info
  console.log('\nCoverage Summary:');
  console.log(`  Lines:      ${totalCoverage.lines.pct}%`);
  console.log(`  Statements: ${totalCoverage.statements.pct}%`);
  console.log(`  Functions:  ${totalCoverage.functions.pct}%`);
  console.log(`  Branches:   ${totalCoverage.branches.pct}%`);
  console.log(`  Average:    ${averageCoverage}%`);
} catch (error) {
  console.error('Error updating coverage badge:', error.message);
  process.exit(0); // Don't fail the commit
}

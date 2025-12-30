#!/usr/bin/env node

// CSS !Important Cop - The specificity sheriff in town!
// BADGE: "I fight !important with !important"

const fs = require('fs');
const path = require('path');

// The crime scene: your CSS files
function investigateFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let crimes = [];
        
        lines.forEach((line, index) => {
            // Look for the perp: !important declarations
            if (line.includes('!important')) {
                crimes.push({
                    line: index + 1,
                    code: line.trim(),
                    // Calculate the "crime severity" - more !important = worse
                    severity: (line.match(/!important/g) || []).length
                });
            }
        });
        
        return crimes;
    } catch (error) {
        console.log(`🚨 Could not process ${filePath}: ${error.message}`);
        return [];
    }
}

// The main investigation
function investigateDirectory(dirPath) {
    const results = {
        totalCrimes: 0,
        files: {},
        worstOffender: null
    };
    
    function walk(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        items.forEach(item => {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (item.endsWith('.css')) {
                const crimes = investigateFile(fullPath);
                if (crimes.length > 0) {
                    results.files[fullPath] = crimes;
                    results.totalCrimes += crimes.length;
                    
                    // Track the worst file (most !important per line ratio)
                    if (!results.worstOffender || crimes.length > results.worstOffender.crimes) {
                        results.worstOffender = {
                            file: fullPath,
                            crimes: crimes.length
                        };
                    }
                }
            }
        });
    }
    
    walk(dirPath);
    return results;
}

// Print the police report
function printReport(results) {
    console.log('\n🔍 CSS !IMPORTANT COP REPORT 🔍');
    console.log('=' .repeat(40));
    
    if (results.totalCrimes === 0) {
        console.log('✅ All clear! No !important crimes detected.');
        console.log('You\'re a CSS specificity hero! 🦸');
        return;
    }
    
    console.log(`🚨 Found ${results.totalCrimes} !important crimes!`);
    console.log(`📁 In ${Object.keys(results.files).length} files`);
    
    if (results.worstOffender) {
        console.log(`\n🏆 WORST OFFENDER: ${results.worstOffender.file}`);
        console.log(`   With ${results.worstOffender.crimes} violations!`);
    }
    
    console.log('\n📋 DETAILED REPORT:');
    Object.entries(results.files).forEach(([file, crimes]) => {
        console.log(`\n${file}:`);
        crimes.forEach(crime => {
            const severity = '!'.repeat(Math.min(crime.severity, 5));
            console.log(`  Line ${crime.line}: ${crime.code} ${severity}`);
        });
    });
    
    console.log('\n💡 REMEDY: Use specificity, not !important force!');
    console.log('   (Or just add !!!important to win the war... 🤦)');
}

// Main execution
const targetDir = process.argv[2] || '.';
console.log(`👮 CSS !Important Cop investigating: ${targetDir}`);

const results = investigateDirectory(targetDir);
printReport(results);

// Exit with appropriate "crime level" code
process.exit(results.totalCrimes > 0 ? 1 : 0);

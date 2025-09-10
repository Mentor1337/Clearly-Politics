#!/usr/bin/env node

/**
 * Data Validation Script for Clearly Politics
 * Validates data integrity and quality before publishing
 */

const fs = require('fs').promises;
const path = require('path');

class DataValidator {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.processedDir = path.join(this.dataDir, 'processed');
        
        this.validationRules = {
            required_fields: [
                'gunViolenceByPolitics',
                'politicalViolenceBreakdown', 
                'metadata'
            ],
            numeric_ranges: {
                'gunViolenceByPolitics.red.rate': { min: 0, max: 1000 },
                'gunViolenceByPolitics.blue.rate': { min: 0, max: 1000 },
                'politicalViolenceBreakdown.rightWingExtremism': { min: 0, max: 10000 },
                'politicalViolenceBreakdown.leftWingExtremism': { min: 0, max: 10000 }
            },
            data_freshness: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        };
        
        this.warnings = [];
        this.errors = [];
    }

    async validateAll() {
        console.log('🔍 Starting data validation...\n');
        
        try {
            // Check if data files exist
            await this.checkFileExistence();
            
            // Load and validate latest data
            const data = await this.loadLatestData();
            
            // Run validation checks
            this.validateStructure(data);
            this.validateDataTypes(data);
            this.validateRanges(data);
            this.validateFreshness(data);
            this.validateConsistency(data);
            
            // Generate validation report
            this.generateReport();
            
            // Exit with appropriate code
            if (this.errors.length > 0) {
                console.error('❌ Validation failed with errors');
                process.exit(1);
            } else if (this.warnings.length > 0) {
                console.warn('⚠️ Validation completed with warnings');
                process.exit(0);
            } else {
                console.log('✅ Validation passed successfully');
                process.exit(0);
            }
            
        } catch (error) {
            console.error('💥 Validation process failed:', error);
            process.exit(1);
        }
    }

    async checkFileExistence() {
        const requiredFiles = [
            'latest.json'
        ];
        
        for (const file of requiredFiles) {
            const filePath = path.join(this.processedDir, file);
            try {
                await fs.access(filePath);
                console.log(`✓ Found ${file}`);
            } catch (error) {
                this.errors.push(`Missing required file: ${file}`);
            }
        }
    }

    async loadLatestData() {
        try {
            const filePath = path.join(this.processedDir, 'latest.json');
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            console.log('✓ JSON data loaded and parsed successfully');
            return data;
        } catch (error) {
            this.errors.push(`Failed to load data: ${error.message}`);
            throw error;
        }
    }

    validateStructure(data) {
        console.log('\n📋 Validating data structure...');
        
        for (const field of this.validationRules.required_fields) {
            if (!this.getNestedValue(data, field)) {
                this.errors.push(`Missing required field: ${field}`);
            } else {
                console.log(`✓ ${field} present`);
            }
        }
    }

    validateDataTypes(data) {
        console.log('\n🔢 Validating data types...');
        
        const typeChecks = [
            { path: 'gunViolenceByPolitics.red.incidents', type: 'number' },
            { path: 'gunViolenceByPolitics.blue.incidents', type: 'number' },
            { path: 'gunViolenceByPolitics.red.rate', type: 'number' },
            { path: 'gunViolenceByPolitics.blue.rate', type: 'number' },
            { path: 'politicalViolenceBreakdown.rightWingExtremism', type: 'number' },
            { path: 'politicalViolenceBreakdown.leftWingExtremism', type: 'number' },
            { path: 'metadata.processedAt', type: 'string' }
        ];
        
        for (const check of typeChecks) {
            const value = this.getNestedValue(data, check.path);
            if (value !== undefined && value !== null) {
                const actualType = typeof value;
                if (actualType !== check.type) {
                    this.errors.push(`${check.path} should be ${check.type}, got ${actualType}`);
                } else {
                    console.log(`✓ ${check.path} is ${check.type}`);
                }
            }
        }
    }

    validateRanges(data) {
        console.log('\n📊 Validating numeric ranges...');
        
        for (const [field, range] of Object.entries(this.validationRules.numeric_ranges)) {
            const value = this.getNestedValue(data, field);
            
            if (value !== undefined && value !== null) {
                if (value < range.min || value > range.max) {
                    this.warnings.push(`${field} (${value}) outside expected range [${range.min}, ${range.max}]`);
                } else {
                    console.log(`✓ ${field} (${value}) within range`);
                }
            }
        }
    }

    validateFreshness(data) {
        console.log('\n⏰ Validating data freshness...');
        
        const processedAt = this.getNestedValue(data, 'metadata.processedAt');
        
        if (processedAt) {
            const processedDate = new Date(processedAt);
            const now = new Date();
            const age = now - processedDate;
            
            if (isNaN(processedDate.getTime())) {
                this.errors.push('Invalid processedAt timestamp format');
            } else if (age > this.validationRules.data_freshness) {
                this.warnings.push(`Data is ${Math.round(age / (24 * 60 * 60 * 1000))} days old`);
            } else {
                console.log(`✓ Data is fresh (${Math.round(age / (60 * 60 * 1000))} hours old)`);
            }
        } else {
            this.errors.push('Missing processedAt timestamp');
        }
    }

    validateConsistency(data) {
        console.log('\n🔄 Validating data consistency...');
        
        // Check that red + blue + swing state data is reasonable
        const redRate = this.getNestedValue(data, 'gunViolenceByPolitics.red.rate');
        const blueRate = this.getNestedValue(data, 'gunViolenceByPolitics.blue.rate');
        
        if (redRate && blueRate) {
            // Check if rates are drastically different (might indicate data error)
            const ratio = Math.max(redRate, blueRate) / Math.min(redRate, blueRate);
            if (ratio > 10) {
                this.warnings.push(`Large rate difference between red (${redRate}) and blue (${blueRate}) states`);
            } else {
                console.log(`✓ Red/blue state rates within reasonable ratio (${ratio.toFixed(2)})`);
            }
        }
        
        // Check political violence totals
        const rightWing = this.getNestedValue(data, 'politicalViolenceBreakdown.rightWingExtremism');
        const leftWing = this.getNestedValue(data, 'politicalViolenceBreakdown.leftWingExtremism');
        
        if (rightWing && leftWing) {
            const total = rightWing + leftWing;
            if (total === 0) {
                this.errors.push('No political violence incidents recorded');
            } else {
                console.log(`✓ Political violence data consistent (${total} total incidents)`);
            }
        }
    }

    validateStateSums(data) {
        console.log('\n🗺️ Validating state-level data...');
        
        // If state-level data exists, validate it sums correctly
        const stateData = this.getNestedValue(data, 'stateBreakdown');
        if (stateData && Array.isArray(stateData)) {
            const totalIncidents = stateData.reduce((sum, state) => sum + (state.incidents || 0), 0);
            const expectedTotal = this.getNestedValue(data, 'totalIncidents');
            
            if (expectedTotal && Math.abs(totalIncidents - expectedTotal) > 100) {
                this.warnings.push(`State totals (${totalIncidents}) don't match expected total (${expectedTotal})`);
            } else {
                console.log(`✓ State-level data sums correctly`);
            }
        }
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    generateReport() {
        console.log('\n📋 Validation Report');
        console.log('='.repeat(50));
        
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach((error, i) => {
                console.log(`${i + 1}. ${error}`);
            });
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            this.warnings.forEach((warning, i) => {
                console.log(`${i + 1}. ${warning}`);
            });
        }
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('\n✅ All validation checks passed!');
        }
        
        // Save validation report
        const report = {
            timestamp: new Date().toISOString(),
            status: this.errors.length > 0 ? 'failed' : 'passed',
            errors: this.errors,
            warnings: this.warnings
        };
        
        this.saveReport(report);
    }

    async saveReport(report) {
        try {
            const reportPath = path.join(this.dataDir, 'validation-report.json');
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n💾 Validation report saved to: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save validation report:', error);
        }
    }
}

// CLI execution
if (require.main === module) {
    const validator = new DataValidator();
    validator.validateAll();
}

module.exports = DataValidator;
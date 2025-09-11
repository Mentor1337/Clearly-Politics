/**
 * Data Processor for Clearly Politics Dashboard
 * Handles data cleaning, transformation, and analysis
 */

class DataProcessor {
    constructor() {
        this.statePopulations = {
            'AL': 5108468, 'AK': 733406, 'AZ': 7359197, 'AR': 3045637,
            'CA': 38965193, 'CO': 5895630, 'CT': 3626205, 'DE': 1003384,
            'FL': 22610726, 'GA': 10912876, 'HI': 1440196, 'ID': 1964726,
            'IL': 12620571, 'IN': 6833037, 'IA': 3207004, 'KS': 2940865,
            'KY': 4512310, 'LA': 4590241, 'ME': 1395722, 'MD': 6164660,
            'MA': 7001399, 'MI': 10037261, 'MN': 5737915, 'MS': 2940057,
            'MO': 6196994, 'MT': 1122069, 'NE': 1986765, 'NV': 3194176,
            'NH': 1402054, 'NJ': 9261699, 'NM': 2113344, 'NY': 19469232,
            'NC': 10835491, 'ND': 783926, 'OH': 11785935, 'OK': 4019800,
            'OR': 4233358, 'PA': 12972008, 'RI': 1095962, 'SC': 5282634,
            'SD': 909824, 'TN': 7126489, 'TX': 30503301, 'UT': 3380800,
            'VT': 647464, 'VA': 8715698, 'WA': 7812880, 'WV': 1775156,
            'WI': 5892539, 'WY': 581381
        };

        this.politicalClassifications = {
            red: [
                'AL', 'AK', 'AR', 'FL', 'ID', 'IN', 'IA', 'KS', 'KY', 'LA',
                'MS', 'MO', 'MT', 'NE', 'ND', 'OH', 'OK', 'SC', 'SD', 'TN',
                'TX', 'UT', 'WV', 'WY'
            ],
            blue: [
                'CA', 'CO', 'CT', 'DE', 'HI', 'IL', 'ME', 'MD', 'MA', 'MI',
                'MN', 'NV', 'NH', 'NJ', 'NM', 'NY', 'OR', 'RI', 'VT', 'VA',
                'WA', 'DC'
            ],
            swing: ['AZ', 'GA', 'NC', 'PA', 'WI']
        };
    }

    /**
     * Calculate per capita rates
     */
    calculatePerCapita(incidents, population, multiplier = 100000) {
        return (incidents / population) * multiplier;
    }

    /**
     * Process gun violence data by state political affiliation
     */
    processGunViolenceByPolitics(rawData) {
        const redStates = { incidents: 0, population: 0 };
        const blueStates = { incidents: 0, population: 0 };
        const swingStates = { incidents: 0, population: 0 };

        rawData.stateBreakdown.forEach(stateData => {
            const state = stateData.state;
            const incidents = stateData.incidents;
            const population = this.statePopulations[state] || 0;

            if (this.politicalClassifications.red.includes(state)) {
                redStates.incidents += incidents;
                redStates.population += population;
            } else if (this.politicalClassifications.blue.includes(state)) {
                blueStates.incidents += incidents;
                blueStates.population += population;
            } else if (this.politicalClassifications.swing.includes(state)) {
                swingStates.incidents += incidents;
                swingStates.population += population;
            }
        });

        return {
            red: {
                ...redStates,
                rate: this.calculatePerCapita(redStates.incidents, redStates.population)
            },
            blue: {
                ...blueStates,
                rate: this.calculatePerCapita(blueStates.incidents, blueStates.population)
            },
            swing: {
                ...swingStates,
                rate: this.calculatePerCapita(swingStates.incidents, swingStates.population)
            }
        };
    }

    /**
     * Process mass shooting data by political affiliation
     */
    processMassShootingsByPolitics(massShootingData) {
        const byPolitics = { red: 0, blue: 0, swing: 0 };
        const ratesByPolitics = { red: 0, blue: 0, swing: 0 };
        const populationByPolitics = { red: 0, blue: 0, swing: 0 };

        massShootingData.byState.forEach(stateData => {
            const state = stateData.state;
            const count = stateData.count;
            const population = this.statePopulations[state] || 0;

            if (this.politicalClassifications.red.includes(state)) {
                byPolitics.red += count;
                populationByPolitics.red += population;
            } else if (this.politicalClassifications.blue.includes(state)) {
                byPolitics.blue += count;
                populationByPolitics.blue += population;
            } else if (this.politicalClassifications.swing.includes(state)) {
                byPolitics.swing += count;
                populationByPolitics.swing += population;
            }
        });

        // Calculate per capita rates
        ratesByPolitics.red = this.calculatePerCapita(byPolitics.red, populationByPolitics.red);
        ratesByPolitics.blue = this.calculatePerCapita(byPolitics.blue, populationByPolitics.blue);
        ratesByPolitics.swing = this.calculatePerCapita(byPolitics.swing, populationByPolitics.swing);

        return {
            counts: byPolitics,
            rates: ratesByPolitics,
            populations: populationByPolitics
        };
    }

    /**
     * Process political violence by ideology
     */
    processPoliticalViolenceByIdeology(politicalViolenceData) {
        const totalIncidents = politicalViolenceData.rightWingExtremism + 
                              politicalViolenceData.leftWingExtremism + 
                              politicalViolenceData.islamistExtremism + 
                              politicalViolenceData.otherIdeology;

        return {
            data: [
                {
                    category: 'Right-Wing Extremism',
                    incidents: politicalViolenceData.rightWingExtremism,
                    percentage: ((politicalViolenceData.rightWingExtremism / totalIncidents) * 100).toFixed(1)
                },
                {
                    category: 'Left-Wing Extremism', 
                    incidents: politicalViolenceData.leftWingExtremism,
                    percentage: ((politicalViolenceData.leftWingExtremism / totalIncidents) * 100).toFixed(1)
                },
                {
                    category: 'Islamist Extremism',
                    incidents: politicalViolenceData.islamistExtremism,
                    percentage: ((politicalViolenceData.islamistExtremism / totalIncidents) * 100).toFixed(1)
                },
                {
                    category: 'Other/Unknown',
                    incidents: politicalViolenceData.otherIdeology,
                    percentage: ((politicalViolenceData.otherIdeology / totalIncidents) * 100).toFixed(1)
                }
            ],
            total: totalIncidents,
            timeframe: politicalViolenceData.timeframe
        };
    }

    /**
     * Create correlation analysis between gun laws and gun violence
     */
    processGunLawCorrelation(gunLawData, gunViolenceData) {
        const correlationData = [];
        
        // Combine gun law scores with violence rates by state
        gunViolenceData.stateBreakdown.forEach(stateData => {
            const state = stateData.state;
            const lawScore = gunLawData.scores[state];
            const population = this.statePopulations[state];
            
            if (lawScore && population) {
                const violenceRate = this.calculatePerCapita(stateData.incidents, population);
                correlationData.push({
                    state: state,
                    lawScore: lawScore,
                    violenceRate: violenceRate,
                    political: this.getStatePolitics(state)
                });
            }
        });

        // Calculate correlation coefficient
        const correlation = this.calculatePearsonCorrelation(
            correlationData.map(d => d.lawScore),
            correlationData.map(d => d.violenceRate)
        );

        return {
            data: correlationData,
            correlation: correlation,
            interpretation: this.interpretCorrelation(correlation)
        };
    }

    /**
     * Process monthly trends
     */
    processMonthlyTrends(rawTrendData) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Calculate moving averages and growth rates
        const processed = rawTrendData.map((data, index) => {
            const previousMonth = index > 0 ? rawTrendData[index - 1].incidents : data.incidents;
            const growthRate = ((data.incidents - previousMonth) / previousMonth * 100).toFixed(1);
            
            return {
                ...data,
                growthRate: index === 0 ? 0 : parseFloat(growthRate),
                movingAverage: this.calculateMovingAverage(rawTrendData, index, 3)
            };
        });

        return {
            data: processed,
            totalIncidents: rawTrendData.reduce((sum, month) => sum + month.incidents, 0),
            averageMonthly: Math.round(rawTrendData.reduce((sum, month) => sum + month.incidents, 0) / rawTrendData.length),
            trend: this.analyzeTrend(rawTrendData.map(d => d.incidents))
        };
    }

    /**
     * Get state political classification
     */
    getStatePolitics(state) {
        if (this.politicalClassifications.red.includes(state)) return 'red';
        if (this.politicalClassifications.blue.includes(state)) return 'blue';
        if (this.politicalClassifications.swing.includes(state)) return 'swing';
        return 'unknown';
    }

    /**
     * Calculate Pearson correlation coefficient
     */
    calculatePearsonCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    /**
     * Interpret correlation coefficient
     */
    interpretCorrelation(r) {
        const absR = Math.abs(r);
        let strength;
        let direction = r < 0 ? 'negative' : 'positive';

        if (absR >= 0.7) strength = 'strong';
        else if (absR >= 0.4) strength = 'moderate';
        else if (absR >= 0.2) strength = 'weak';
        else strength = 'very weak';

        return {
            value: r.toFixed(3),
            strength: strength,
            direction: direction,
            description: `${strength} ${direction} correlation`
        };
    }

    /**
     * Calculate moving average
     */
    calculateMovingAverage(data, currentIndex, windowSize) {
        const start = Math.max(0, currentIndex - Math.floor(windowSize / 2));
        const end = Math.min(data.length, start + windowSize);
        const window = data.slice(start, end);
        const average = window.reduce((sum, item) => sum + item.incidents, 0) / window.length;
        return Math.round(average);
    }

    /**
     * Analyze trend direction
     */
    analyzeTrend(data) {
        if (data.length < 2) return 'insufficient data';
        
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (percentChange > 5) return 'increasing';
        if (percentChange < -5) return 'decreasing';
        return 'stable';
    }

    /**
     * Generate summary statistics
     */
    generateSummaryStats(allData) {
        const gunViolence = allData.gunViolence;
        const politicalViolence = allData.politicalViolence;
        const massShootings = allData.massShootings;

        const redStateStats = this.processGunViolenceByPolitics(gunViolence);
        const politicalStats = this.processPoliticalViolenceByIdeology(politicalViolence);

        return {
            keyFindings: [
                `Gun violence rate in red states: ${redStateStats.red.rate.toFixed(1)} per 100k residents`,
                `Gun violence rate in blue states: ${redStateStats.blue.rate.toFixed(1)} per 100k residents`,
                `${politicalStats.data[0].percentage}% of political violence is right-wing extremism`,
                `${politicalStats.data[1].percentage}% of political violence is left-wing extremism`,
                `Total mass shootings in 2024: ${massShootings.totalEvents}`
            ],
            redVsBlueRatio: (redStateStats.red.rate / redStateStats.blue.rate).toFixed(2),
            politicalViolenceSkew: (politicalViolence.rightWingExtremism / politicalViolence.leftWingExtremism).toFixed(1),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Clean and validate data
     */
    validateAndCleanData(rawData) {
        const cleaned = { ...rawData };
        
        // Remove null/undefined values
        Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === null || cleaned[key] === undefined) {
                delete cleaned[key];
            }
        });

        // Ensure numeric values are actually numbers
        if (cleaned.incidents) cleaned.incidents = parseInt(cleaned.incidents) || 0;
        if (cleaned.deaths) cleaned.deaths = parseInt(cleaned.deaths) || 0;
        if (cleaned.injuries) cleaned.injuries = parseInt(cleaned.injuries) || 0;

        return cleaned;
    }

    /**
     * Export processed data for caching
     */
    exportProcessedData(processedData) {
        return {
            data: processedData,
            processedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Process GVA data
     */
    async processGVAData(csvData) {
        const incidents = csvData.split('\n')
            .slice(1) // Skip header row
            .filter(line => line.trim())
            .map(line => {
                const [
                    id, date, _, timestamp, state, city, address, venue,
                    lat, lon, killed, injured, numKilled, numInjured,
                    numChildrenKilled, numTeensKilled, numChildrenInjured,
                    characteristics, sources, incidentDate, year
                ] = this.parseCSVLine(line);

                return {
                    id,
                    date: new Date(incidentDate),
                    state,
                    city,
                    address,
                    venue: venue === 'N/A' ? null : venue,
                    location: {
                        lat: parseFloat(lat),
                        lon: parseFloat(lon)
                    },
                    casualties: {
                        killed: parseInt(numKilled) || 0,
                        injured: parseInt(numInjured) || 0,
                        childrenKilled: parseInt(numChildrenKilled) || 0,
                        teensKilled: parseInt(numTeensKilled) || 0,
                        childrenInjured: parseInt(numChildrenInjured) || 0
                    },
                    characteristics: characteristics.split(',').map(c => c.trim()),
                    sources: this.parseSources(sources),
                    year: parseInt(year)
                };
            });

        // Process incidents into useful statistics
        const stats = {
            total: incidents.length,
            byState: {},
            byYear: {},
            byCharacteristic: {},
            totalCasualties: {
                killed: 0,
                injured: 0,
                childrenKilled: 0,
                teensKilled: 0,
                childrenInjured: 0
            }
        };

        // Calculate statistics
        incidents.forEach(incident => {
            // State stats
            if (!stats.byState[incident.state]) {
                stats.byState[incident.state] = {
                    incidents: 0,
                    killed: 0,
                    injured: 0
                };
            }
            stats.byState[incident.state].incidents++;
            stats.byState[incident.state].killed += incident.casualties.killed;
            stats.byState[incident.state].injured += incident.casualties.injured;

            // Year stats
            if (!stats.byYear[incident.year]) {
                stats.byYear[incident.year] = {
                    incidents: 0,
                    killed: 0,
                    injured: 0
                };
            }
            stats.byYear[incident.year].incidents++;
            stats.byYear[incident.year].killed += incident.casualties.killed;
            stats.byYear[incident.year].injured += incident.casualties.injured;

            // Characteristics stats
            incident.characteristics.forEach(char => {
                if (!stats.byCharacteristic[char]) {
                    stats.byCharacteristic[char] = 0;
                }
                stats.byCharacteristic[char]++;
            });

            // Total casualties
            stats.totalCasualties.killed += incident.casualties.killed;
            stats.totalCasualties.injured += incident.casualties.injured;
            stats.totalCasualties.childrenKilled += incident.casualties.childrenKilled;
            stats.totalCasualties.teensKilled += incident.casualties.teensKilled;
            stats.totalCasualties.childrenInjured += incident.casualties.childrenInjured;
        });

        return {
            incidents,
            statistics: stats,
            lastUpdated: new Date().toISOString(),
            source: 'Gun Violence Archive Historical Data'
        };
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.replace(/^"|"$/g, ''));
        
        return values;
    }

    parseSources(sources) {
        if (!sources) return [];
        return sources
            .replace(/^c\("/, '')
            .replace(/"\)$/, '')
            .split('", "')
            .filter(url => url && url !== 'N/A');
    }
}

// Export for use in other modules
window.DataProcessor = DataProcessor;
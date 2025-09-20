require('dotenv').config();
const fs = require('fs');
const path = require('path');

class SeederRunner {
    constructor() {
        this.seedersPath = path.join(__dirname, 'seeders');
    }

    async getSeederFiles() {
        try {
            const files = fs.readdirSync(this.seedersPath)
                .filter(file => file.endsWith('.js'))
                .sort();
            return files;
        } catch (error) {
            console.error('Error reading seeders directory:', error);
            return [];
        }
    }

    async runSeeders(specificSeeder = null) {
        console.log('🌱 Starting database seeding...');
        
        try {
            const seederFiles = await this.getSeederFiles();
            
            if (seederFiles.length === 0) {
                console.log('No seeders found');
                return;
            }

            let filesToRun = seederFiles;
            
            // If specific seeder is requested
            if (specificSeeder) {
                const seederFile = seederFiles.find(file => 
                    file.toLowerCase().includes(specificSeeder.toLowerCase())
                );
                
                if (!seederFile) {
                    console.error(`❌ Seeder not found: ${specificSeeder}`);
                    console.log('Available seeders:', seederFiles.map(f => f.replace('.js', '')).join(', '));
                    return;
                }
                
                filesToRun = [seederFile];
            }

            console.log(`📋 Running ${filesToRun.length} seeder(s)`);

            for (const seederFile of filesToRun) {
                try {
                    console.log(`⏳ Running seeder: ${seederFile}`);
                    
                    const SeederClass = require(path.join(this.seedersPath, seederFile));
                    const seeder = new SeederClass();
                    
                    await seeder.run();
                    
                    console.log(`✅ Seeder completed: ${seederFile}`);
                } catch (error) {
                    console.error(`❌ Seeder failed: ${seederFile}`);
                    console.error(error);
                    
                    // Continue with other seeders instead of stopping
                    continue;
                }
            }

            console.log('🎉 Database seeding completed!');
        } catch (error) {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        }
    }

    async listSeeders() {
        const seederFiles = await this.getSeederFiles();
        
        if (seederFiles.length === 0) {
            console.log('No seeders found');
            return;
        }

        console.log('📋 Available seeders:');
        seederFiles.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file.replace('.js', '')}`);
        });
    }
}

// CLI interface
const runner = new SeederRunner();

if (require.main === module) {
    const command = process.argv[2];
    const seederName = process.argv[3];
    
    if (command === 'list') {
        runner.listSeeders()
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    } else if (command === 'run') {
        runner.runSeeders(seederName)
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    } else {
        // Default: run all seeders
        runner.runSeeders()
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    }
}

module.exports = SeederRunner;

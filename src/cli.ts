import { Command } from 'commander';
import { formatSourceCode } from './formatter.js';
import fs from 'fs/promises';

const program = new Command();

program
    .version('1.0.0')
    .description('Format source code given a file path and the programming language')
    .command('format <language> <filePath>')
    .description('Format source code given a file path and the programming language')
    .action(async (language, filePath) => {
        try {
            const sourceCode = await fs.readFile(filePath, 'utf-8');
            const formattedCode = await formatSourceCode(language, sourceCode);
            console.log(formattedCode);
        } catch (error) {
            console.error('Error formatting source code:', error);
            process.exit(1);
        }
    });

program.parse(process.argv);
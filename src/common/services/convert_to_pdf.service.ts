import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';

@Injectable()
export class ConverterService {
  async convertExcelToPDF(
    inputFile: string,
    outputDir: string,
  ): Promise<string> {
    let libreOfficePath = `"${path.resolve()}\\LibreOffice\\program\\soffice.exe"`;
    if (process.env.OP == 'linux') libreOfficePath = 'soffice';
    const outputPath = path.join(outputDir, 'output.pdf');

    // Command to convert Excel to PDF using LibreOffice
    const command = `${libreOfficePath} --headless --convert-to pdf "${inputFile}" --outdir "${outputDir}"`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error during conversion: ${error.message}`);
          return reject(
            'Failed to generate PDF. Please check the input file and try again.',
          );
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return reject(
            'Failed to generate PDF. There was an issue with the conversion process.',
          );
        }
        // console.log(`Conversion successful: PDF saved at ${outputPath}`);
        resolve(outputPath);
      });
    });
  }
}

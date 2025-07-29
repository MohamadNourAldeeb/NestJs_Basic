import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import { writeFile, mkdir } from 'fs/promises';
export const commonArrayElements = (firstArray: any, secondArray: any) => {
  return firstArray.filter((element: any) => secondArray.includes(element));
};
export const uncommonArrayElements = (firstArray: any, secondArray: any) => {
  return firstArray.filter((element: any) => !secondArray.includes(element));
};
function capitalizeFirstLetter(str: string): string {
  if (!str) return str; // Handle empty string
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function generatePassword(userName: string): string {
  const symbols = ['@', '#', '$', '&'];
  const randomSymbols = symbols[Math.floor(Math.random() * 4)];

  const numberPart = Math.floor(Math.random() * 9000) + 1000;

  userName = capitalizeFirstLetter(userName);
  return `${userName}${randomSymbols}${numberPart}`;
}
export const welcomeLog = async (port: string) => {
  console.log(
    '\x1b[33m%s\x1b[0m',
    '┌──────────────────────────────────────────────────────────────────┐',
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `│ Welcome to the Nestjs  backend server                         🆗 │`,
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `│ This project is built using nest js                           🔃 │`,
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `│ and Mysql database with redis NoSql                           🔛 │`,
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `│ This is the development version ,                             🔃 │`,
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `│ server run on : http://localhost:${port}                            │`,
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `│ Developed by : ENG.MOHAMAD NOOR ALDEEB                           │`,
  );

  console.log(
    '\x1b[33m%s\x1b[0m',
    '└──────────────────────────────────────────────────────────────────┘',
  );
};
export const timeToMilliseconds = (timeString: string) => {
  const parts: any = timeString.split(' ');
  let totalMilliseconds = 0;

  for (const part of parts) {
    const [value, unit] = part.match(/(\d+)([dhm])/).slice(1);

    switch (unit.toLowerCase()) {
      case 'h':
        totalMilliseconds += parseInt(value) * 3600000; // Convert hours to milliseconds
        break;
      case 'd':
        totalMilliseconds += parseInt(value) * 86400000; // Convert days to milliseconds
        break;
      case 'm':
        totalMilliseconds += parseInt(value) * 60000; // Convert minutes to milliseconds
        break;
      default:
        console.error(`Unknown unit: ${unit}`);
    }
  }

  return totalMilliseconds;
};
export const timeToSeconds = (timeString: string) => {
  const parts: any = timeString.split(' ');
  let totalSeconds = 0;

  for (const part of parts) {
    const [value, unit] = part.match(/(\d+)([dhm])/).slice(1);

    switch (unit.toLowerCase()) {
      case 'h':
        totalSeconds += parseInt(value) * 3600; // Convert hours to seconds
        break;
      case 'd':
        totalSeconds += parseInt(value) * 86400; // Convert days to seconds
        break;
      case 'm':
        totalSeconds += parseInt(value) * 60; // Convert minutes to seconds
        break;
      default:
        console.error(`Unknown unit: ${unit}`);
    }
  }

  return totalSeconds;
};
export const downloadAndSaveProfilePicture = async (
  url: string,
  name: string,
) => {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid image URL');
    }
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const filename = `${Date.now()}-${name}.jpg`;
    const filePath = path.join(process.cwd(), 'uploads', 'profiles', filename);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, response.data);
  } catch (error) {
    console.error('Failed to download or save picture:', error.message);
  }
};
export const compareVersions = (currentVersion, newVersion) => {
  const currentParts = currentVersion.split('.').map(Number);
  const newParts = newVersion.split('.').map(Number);

  if (
    newParts[0] > currentParts[0] ||
    (newParts[0] === currentParts[0] && newParts[1] > currentParts[1]) ||
    (newParts[0] === currentParts[0] &&
      newParts[1] === currentParts[1] &&
      newParts[2] > currentParts[2])
  ) {
    return true;
  }

  return false;
};

import { Reader, CityResponse } from 'maxmind';

let lookup = null;

export async function loadGeoIPDatabase() {
  const dbPath = path.join(
    process.cwd(),
    'src',
    'common',
    'resources',
    'GeoLite2-Country.mmdb',
  );
  try {
    const buffer = fs.readFileSync(dbPath);
    lookup = new Reader<CityResponse>(buffer);

    console.log('GeoIP DB loaded successfully.');
  } catch (error) {
    console.error('Failed to load GeoIP DB:', error.message);
  }
}

export async function getCountryFromIP(ip: string): Promise<any> {
  if (!lookup) return null;

  const geo = lookup.get(ip);

  return geo?.country?.names?.en ?? null;
}

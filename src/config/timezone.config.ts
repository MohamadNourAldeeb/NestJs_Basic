import { registerAs } from '@nestjs/config';

export default registerAs('timezone', () => ({
    // Default timezone offset in milliseconds for Damascus (UTC+3)
    offsetMs: parseInt(process.env.TIMEZONE_OFFSET_HOURS) * 60 * 60 * 1000 || 0,

    // Timezone name
    name: process.env.TIMEZONE_NAME || 'Asia/Damascus',

    // Offset in hours (for display purposes);
    offsetHours: parseInt(process.env.TIMEZONE_OFFSET_HOURS) || 0,
}));

export interface TimezoneConfig {
    offsetMs: number;
    name: string;
    offsetHours: number;
} 
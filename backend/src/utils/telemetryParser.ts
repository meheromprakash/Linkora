import crypto from 'crypto';
import UAParser from 'ua-parser-js';
import { env } from '../config/env.js';

export interface ParsedTelemetry {
  referrer: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
  browser: string;
  os: string;
  ipHash: string;
}

export const hashIP = (ip: string): string => {
  const salt = env.IP_SALT || 'linkora_default_salt';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex');
};

export const parseRequestTelemetry = (
  ip: string,
  userAgentHeader?: string,
  referrerHeader?: string
): ParsedTelemetry => {
  const parser = new UAParser(userAgentHeader);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown' = 'desktop';

  if (device.type === 'mobile') deviceType = 'mobile';
  else if (device.type === 'tablet') deviceType = 'tablet';
  else if (userAgentHeader && /bot|crawler|spider|googlebot|bingbot/i.test(userAgentHeader)) {
    deviceType = 'bot';
  } else if (!device.type) {
    deviceType = 'desktop';
  }

  let cleanReferrer = 'Direct / None';
  if (referrerHeader && referrerHeader.trim() !== '') {
    try {
      const url = new URL(referrerHeader);
      cleanReferrer = url.hostname.replace('www.', '');
    } catch {
      cleanReferrer = referrerHeader;
    }
  }

  return {
    referrer: cleanReferrer,
    deviceType,
    browser: browser.name || 'Unknown',
    os: os.name || 'Unknown',
    ipHash: hashIP(ip || '127.0.0.1'),
  };
};

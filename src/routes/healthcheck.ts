import express, { Request, Response } from 'express';
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // // Note: Local lookups will return null for local network IPs like ::1 or 127.0.0.1
    // const geo = geoip.lookup(ip);

    // if (!geo) {
    //   return res
    //     .status(400)
    //     .json({ error: 'Location could not be determined.' });
    // }

    // res.json({
    //   country: geo.country,
    //   region: geo.region,
    //   city: geo.city,
    //   ll: geo.ll, // [latitude, longitude]
    // });
    const ua = req.headers['user-agent'];

    // Parse the string using ua-parser-js
    const parser = new UAParser(ua);
    const browser = parser.getBrowser();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        name: browser.name, // e.g., "Chrome"
        version: browser.version, // e.g., "120.0.0.0"
        major: browser.major, // e.g., "120"
      }),
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch geolocation data' });
  }
});

export default router;

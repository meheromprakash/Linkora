import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { ShortLink } from '../models/ShortLink.js';
import { ClickEvent } from '../models/ClickEvent.js';
import { BioProfile } from '../models/BioProfile.js';
import { hashIP } from '../utils/telemetryParser.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/linkora';

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for database seeding...');
    await mongoose.connect(MONGO_URI);

    console.log('🧹 Cleaning existing collection data...');
    await Promise.all([
      User.deleteMany({}),
      ShortLink.deleteMany({}),
      ClickEvent.deleteMany({}),
      BioProfile.deleteMany({}),
    ]);

    console.log('👤 Creating demo user account...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'demo@linkora.io',
      passwordHash,
      isVerified: true,
    });

    console.log(`✅ Demo User Created: demo@linkora.io / Password123`);

    console.log('🔗 Creating sample short links...');
    const linksData = [
      {
        userId: demoUser._id,
        originalUrl: 'https://github.com/com-bot/technical-assessment',
        shortCode: 'combot',
        customSlug: 'combot',
        title: 'Com.bot Engineering Docs',
        tags: ['assessment', 'docs'],
        clickCount: 142,
        isActive: true,
      },
      {
        userId: demoUser._id,
        originalUrl: 'https://react.dev/blog/2024/04/25/react-19',
        shortCode: 'react19',
        customSlug: 'react19',
        title: 'React 19 Release Notes',
        tags: ['frontend', 'react'],
        clickCount: 89,
        isActive: true,
      },
      {
        userId: demoUser._id,
        originalUrl: 'https://tailwindcss.com/docs/guides/vite',
        shortCode: 'twvite',
        customSlug: 'twvite',
        title: 'Tailwind CSS Vite Integration Guide',
        tags: ['css', 'vite'],
        clickCount: 64,
        isActive: true,
      },
      {
        userId: demoUser._id,
        originalUrl: 'https://expressjs.com/en/4x/api.html',
        shortCode: 'exapi4',
        title: 'Express v4 API Specification',
        tags: ['backend', 'express'],
        clickCount: 31,
        isActive: true,
      },
      {
        userId: demoUser._id,
        originalUrl: 'https://www.mongodb.com/docs/manual/aggregation/',
        shortCode: 'mgpipe',
        title: 'MongoDB Aggregation Pipeline Docs',
        tags: ['database', 'mongo'],
        clickCount: 22,
        isActive: true,
      },
    ];

    const insertedLinks = await ShortLink.insertMany(linksData);
    console.log(`✅ ${insertedLinks.length} Short Links Created.`);

    console.log('📊 Generating realistic click telemetry data...');
    const referrers = ['github.com', 'twitter.com', 'linkedin.com', 'google.com', 'Direct / None'];
    const devices: Array<'desktop' | 'mobile' | 'tablet'> = ['desktop', 'desktop', 'mobile', 'mobile', 'tablet'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const oses = ['Windows', 'macOS', 'iOS', 'Android'];

    const clickEvents = [];
    const now = new Date();

    for (const link of insertedLinks) {
      // Generate clicks distributed across the last 7 days
      for (let i = 0; i < link.clickCount; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const clickDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600 * 1000);
        
        const randomIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        
        clickEvents.push({
          linkId: link._id,
          shortCode: link.shortCode,
          timestamp: clickDate,
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          deviceType: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          os: oses[Math.floor(Math.random() * oses.length)],
          ipHash: hashIP(randomIP),
        });
      }
    }

    await ClickEvent.insertMany(clickEvents);
    console.log(`✅ ${clickEvents.length} Click Events seeded.`);

    console.log('📱 Creating Bio-Link Profile for demo user...');
    await BioProfile.create({
      userId: demoUser._id,
      username: 'alexrivera',
      displayName: 'Alex Rivera',
      bio: 'Full-Stack Software Engineer & Tech Explorer. Building next-gen web applications.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      theme: 'gradient-neon',
      links: [
        {
          id: 'bio-1',
          title: '⚡ Com.bot Assessment Repo',
          url: 'http://localhost:5000/r/combot',
          shortLinkId: insertedLinks[0]._id,
          isActive: true,
          order: 1,
        },
        {
          id: 'bio-2',
          title: '⚛️ React 19 Guide',
          url: 'http://localhost:5000/r/react19',
          shortLinkId: insertedLinks[1]._id,
          isActive: true,
          order: 2,
        },
        {
          id: 'bio-3',
          title: '🎨 Tailwind CSS Vite Setup',
          url: 'http://localhost:5000/r/twvite',
          shortLinkId: insertedLinks[2]._id,
          isActive: true,
          order: 3,
        },
      ],
      socials: {
        github: 'https://github.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        website: 'https://linkora.io',
      },
    });

    console.log('✅ Bio Profile Created for /bio/alexrivera');

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('🔑 Demo Login Credentials:');
    console.log('   Email:    demo@linkora.io');
    console.log('   Password: Password123');
    console.log('🔗 Sample Public Short Redirects:');
    console.log('   http://localhost:5000/r/combot');
    console.log('   http://localhost:5000/r/react19');
    console.log('📱 Sample Public Bio Profile:');
    console.log('   http://localhost:5173/bio/alexrivera');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();

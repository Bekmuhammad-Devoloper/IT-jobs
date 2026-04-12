import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Settings
  await prisma.setting.createMany({
    data: [
      { key: 'channel_id', value: '-100XXXXXXXXXX' },
      { key: 'channel_username', value: '@itjobs_channel' },
      { key: 'post_cooldown_days', value: '15' },
      { key: 'bot_token', value: '8342175601:AAHK5EX79frw8tKgqUBGkBqTGwRIY1u3OAg' },
      { key: 'webapp_url', value: 'https://itjobs.example.com' },
      { key: 'yuksalish_url', value: 'https://yuksalish.dev' },
      { key: 'welcome_message', value: 'IT Jobs botiga xush kelibsiz!' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Settings seeded');

  // Categories - Professions
  await prisma.category.createMany({
    data: [
      { name: 'Backend Developer', type: 'profession' },
      { name: 'Frontend Developer', type: 'profession' },
      { name: 'Mobile Developer', type: 'profession' },
      { name: 'DevOps Engineer', type: 'profession' },
      { name: 'UI/UX Designer', type: 'profession' },
      { name: 'QA Engineer', type: 'profession' },
      { name: 'Project Manager', type: 'profession' },
      { name: 'Data Scientist', type: 'profession' },
      { name: 'Full Stack Developer', type: 'profession' },
      { name: 'Cyber Security', type: 'profession' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Profession categories seeded');

  // Categories - Cities
  await prisma.category.createMany({
    data: [
      { name: 'Toshkent', type: 'city' },
      { name: 'Samarqand', type: 'city' },
      { name: 'Buxoro', type: 'city' },
      { name: 'Namangan', type: 'city' },
      { name: 'Andijon', type: 'city' },
      { name: "Farg'ona", type: 'city' },
      { name: 'Nukus', type: 'city' },
      { name: 'Xorazm', type: 'city' },
      { name: 'Remote', type: 'city' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ City categories seeded');

  // Categories - Work Types
  await prisma.category.createMany({
    data: [
      { name: 'Remote', type: 'work_type' },
      { name: 'Office', type: 'work_type' },
      { name: 'Hybrid', type: 'work_type' },
      { name: 'Full-time', type: 'work_type' },
      { name: 'Part-time', type: 'work_type' },
      { name: 'Freelance', type: 'work_type' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Work type categories seeded');

  // Technologies
  await prisma.technology.createMany({
    data: [
      { name: 'JavaScript', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'React', category: 'frontend' },
      { name: 'Next.js', category: 'frontend' },
      { name: 'Vue.js', category: 'frontend' },
      { name: 'Angular', category: 'frontend' },
      { name: 'Tailwind CSS', category: 'frontend' },
      { name: 'Node.js', category: 'backend' },
      { name: 'NestJS', category: 'backend' },
      { name: 'Python', category: 'backend' },
      { name: 'Django', category: 'backend' },
      { name: 'FastAPI', category: 'backend' },
      { name: 'Go', category: 'backend' },
      { name: 'Java', category: 'backend' },
      { name: 'Spring Boot', category: 'backend' },
      { name: 'PHP', category: 'backend' },
      { name: 'Laravel', category: 'backend' },
      { name: 'C#', category: 'backend' },
      { name: '.NET', category: 'backend' },
      { name: 'Ruby', category: 'backend' },
      { name: 'Rust', category: 'backend' },
      { name: 'Flutter', category: 'mobile' },
      { name: 'React Native', category: 'mobile' },
      { name: 'Swift', category: 'mobile' },
      { name: 'Kotlin', category: 'mobile' },
      { name: 'PostgreSQL', category: 'devops' },
      { name: 'MySQL', category: 'devops' },
      { name: 'MongoDB', category: 'devops' },
      { name: 'Redis', category: 'devops' },
      { name: 'Docker', category: 'devops' },
      { name: 'Kubernetes', category: 'devops' },
      { name: 'AWS', category: 'devops' },
      { name: 'Linux', category: 'devops' },
      { name: 'Git', category: 'devops' },
      { name: 'CI/CD', category: 'devops' },
      { name: 'Figma', category: 'design' },
      { name: 'Adobe XD', category: 'design' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Technologies seeded');

  // Yuksalish.dev Services
  await prisma.service.createMany({
    data: [
      {
        title: 'Resume Yaratish',
        slug: 'resume-yaratish',
        description:
          'Professional resume yaratib beramiz. ATS-friendly format. HR mutaxassislari bilan ishlangan shablon.',
        price: "50,000 so'm",
        icon: '📝',
        link: 'https://t.me/yuksalish_dev',
        order: 1,
      },
      {
        title: 'Intervyuga Tayyorgarlik',
        slug: 'intervyuga-tayyorgarlik',
        description:
          'Mock interview va tayyorgarlik dasturi. Real intervyu tajribasi. Feedback va tavsiyalar.',
        price: "100,000 so'm",
        icon: '💼',
        link: 'https://t.me/yuksalish_dev',
        order: 2,
      },
      {
        title: 'Mentorlik Dasturi',
        slug: 'mentorlik-dasturi',
        description:
          "1 oylik shaxsiy mentorlik. Karyera yo'l xaritasi. Haftalik 1:1 sessiyalar.",
        price: "300,000 so'm",
        icon: '🎯',
        link: 'https://t.me/yuksalish_dev',
        order: 3,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Services seeded');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

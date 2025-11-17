import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tutorbook.com' },
    update: {},
    create: {
      email: 'admin@tutorbook.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Tutor User
  const tutorPassword = await bcrypt.hash('Tutor123!', 10);
  const tutorUser = await prisma.user.upsert({
    where: { email: 'tutor@tutorbook.com' },
    update: {},
    create: {
      email: 'tutor@tutorbook.com',
      password: tutorPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'TUTOR',
      phone: '+1234567891',
    },
  });
  console.log('✅ Tutor user created:', tutorUser.email);

  // Create Tutor Profile
  const tutorProfile = await prisma.tutor.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      bio: 'Experienced mathematics tutor with 5 years of teaching experience. Specialized in calculus, algebra, and statistics.',
      subjects: JSON.stringify(['Mathematics', 'Calculus', 'Algebra', 'Statistics']),
      hourlyRate: 50.0,
      experience: 5,
      education: 'Master of Science in Mathematics',
      rating: 4.8,
      totalReviews: 24,
      isActive: true,
    },
  });
  console.log('✅ Tutor profile created for:', tutorUser.email);

  // Create Another Tutor
  const tutor2Password = await bcrypt.hash('Tutor123!', 10);
  const tutor2User = await prisma.user.upsert({
    where: { email: 'sarah.smith@tutorbook.com' },
    update: {},
    create: {
      email: 'sarah.smith@tutorbook.com',
      password: tutor2Password,
      firstName: 'Sarah',
      lastName: 'Smith',
      role: 'TUTOR',
      phone: '+1234567892',
    },
  });

  const tutor2Profile = await prisma.tutor.upsert({
    where: { userId: tutor2User.id },
    update: {},
    create: {
      userId: tutor2User.id,
      bio: 'Physics and chemistry expert with passion for teaching. 7 years of experience helping students excel in sciences.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Biology']),
      hourlyRate: 60.0,
      experience: 7,
      education: 'PhD in Physics',
      rating: 4.9,
      totalReviews: 31,
      isActive: true,
    },
  });
  console.log('✅ Tutor profile created for:', tutor2User.email);

  // Create Student User
  const studentPassword = await bcrypt.hash('Student123!', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@tutorbook.com' },
    update: {},
    create: {
      email: 'student@tutorbook.com',
      password: studentPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'STUDENT',
      phone: '+1234567893',
    },
  });
  console.log('✅ Student user created:', student.email);

  // Create Sample Slots for Tutor 1
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const slots = [];
  for (let i = 0; i < 5; i++) {
    const startTime = new Date(tomorrow);
    startTime.setHours(10 + i * 2);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    const slot = await prisma.slot.create({
      data: {
        tutorId: tutorProfile.id,
        startTime,
        endTime,
        duration: 60,
        isBooked: false,
      },
    });
    slots.push(slot);
  }
  console.log(`✅ Created ${slots.length} slots for tutor: ${tutorUser.email}`);

  // Create Sample Slots for Tutor 2
  const slots2 = [];
  for (let i = 0; i < 5; i++) {
    const startTime = new Date(tomorrow);
    startTime.setHours(14 + i * 2);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    const slot = await prisma.slot.create({
      data: {
        tutorId: tutor2Profile.id,
        startTime,
        endTime,
        duration: 60,
        isBooked: false,
      },
    });
    slots2.push(slot);
  }
  console.log(`✅ Created ${slots2.length} slots for tutor: ${tutor2User.email}`);

  // Create a Sample Booking
  const bookedSlot = slots[0];
  await prisma.slot.update({
    where: { id: bookedSlot.id },
    data: { isBooked: true },
  });

  await prisma.booking.create({
    data: {
      slotId: bookedSlot.id,
      studentId: student.id,
      tutorId: tutorProfile.id,
      subject: 'Calculus',
      notes: 'Need help with derivatives and integrals',
      status: 'CONFIRMED',
    },
  });
  console.log('✅ Sample booking created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

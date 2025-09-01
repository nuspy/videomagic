import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN', name: 'Admin User', previewQuotaUsed: 0 },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      googleId: null,
      previewQuotaUsed: 0,
      previewQuotaResetAt: new Date(),
    },
  })

  // Demo user
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { name: 'Demo User' },
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'USER',
      googleId: null,
      previewQuotaUsed: 0,
    },
  })

  // Demo lead with coherent scenesCount = totalDurationSec / 5
  const totalDurationSec = 45
  const scenesCount = Math.floor(totalDurationSec / 5)

  await prisma.lead.create({
    data: {
      language: 'en',
      contactEmail: 'lead@example.com',
      totalDurationSec,
      scenesCount,
      aiProvider: 'OPENAI',
      aiModel: 'gpt-4o',
      temperature: 0.7,
      status: 'DRAFT',
      answers0: { q: 'goal', a: 'Awareness' },
      answers1: {},
      answers2: {},
      answers3: {},
      answers4: {},
      answers5: {},
      answers6: {},
      answers7: {},
      answers8: {},
      answers9: {},
      form: { format: '16:9', channels: ['web', 'social'], tone: 'friendly' },
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

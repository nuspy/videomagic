/* @vitest-environment node */
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb } from './helpers/db.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Stripe webhook', () => {
  let app

  beforeAll(async () => {
    await startTestDb()
    process.env.NODE_ENV = 'development'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    // Mock Stripe constructEvent to return our event as-is
    vi.doMock('../src/config/payments.js', async () => {
      const actual = await vi.importActual('../src/config/payments.js')
      return {
        ...actual,
        stripe: {
          webhooks: {
            constructEvent: (body, _sig, _secret) => JSON.parse(body.toString('utf8')),
          },
        },
      }
    })

    const mod = await import('../src/app.js')
    app = mod.default
  })

  afterAll(async () => {
    await prisma.$disconnect()
    vi.resetModules()
    await stopTestDb()
  })

  it('marks payment succeeded and order paid', async () => {
    // Seed order + payment with providerPaymentId
    const user = await prisma.user.create({ data: { email: 'p@example.com', role: 'USER' } })
    const order = await prisma.order.create({
      data: { userId: user.id, total: 9.9, currency: 'EUR', taxAmount: 0, status: 'PENDING' },
    })
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'STRIPE',
        providerPaymentId: 'pi_123',
        amount: 9.9,
        currency: 'EUR',
        taxAmount: 0,
        status: 'INITIATED',
        rawPayload: {},
      },
    })

    const event = {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123', amount_received: 990 } },
    }

    const res = await request(app)
      .post('/payments/stripe/webhook')
      .set('stripe-signature', 'test')
      .set('content-type', 'application/json')
      .send(Buffer.from(JSON.stringify(event)))

    expect(res.status).toBe(200)

    const updatedPayment = await prisma.payment.findUnique({ where: { id: payment.id } })
    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } })

    expect(updatedPayment?.status).toBe('SUCCEEDED')
    expect(updatedOrder?.status).toBe('PAID')
  })
})

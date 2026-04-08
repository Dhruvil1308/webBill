import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext, unauthorizedResponse } from '@/lib/auth-utils';
import { z } from 'zod';

// Input Validation Schema
const orderSchema = z.object({
  tableId: z.string().min(1),
  items: z.array(z.object({
    id: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    notes: z.string().optional()
  })).min(1)
});

export async function POST(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) return unauthorizedResponse();

    const body = await req.json();
    const validation = orderSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.format() }, { status: 400 });
    }

    const { tableId, items } = validation.data;
    const { hotelId } = context;

    // Verify table belongs to the hotel
    const table = await prisma.table.findUnique({
      where: { id: tableId, hotelId }
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found or access denied' }, { status: 404 });
    }

    const computedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 1. Create the Order with explicit transaction scoping
    const order = await prisma.order.create({
      data: {
        tableId,
        hotelId,
        totalAmount: computedTotal,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            itemId: item.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || '',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) return unauthorizedResponse();

    const { hotelId } = context;

    const orders = await prisma.order.findMany({
      where: { hotelId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Order Fetch Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingPurpose, BookingStatus } from '@prisma/client';

export interface CreateBookingDto {
  organisationId: string;
  buildingId: string;
  elevatorId: string;
  userId: string;
  purpose: BookingPurpose;
  startTime: string;
  endTime: string;
  contactName: string;
  contactPhone: string;
}

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organisationId?: string, buildingId?: string) {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;
    if (buildingId) where.buildingId = buildingId;

    return this.prisma.booking.findMany({
      where,
      include: {
        elevator: { select: { id: true, name: true, assetCode: true } },
        building: { select: { id: true, name: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async create(dto: CreateBookingDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    // Conflict detection: Check for overlapping approved/active bookings on this elevator
    const conflicting = await this.prisma.booking.findFirst({
      where: {
        elevatorId: dto.elevatorId,
        status: { in: [BookingStatus.APPROVED, BookingStatus.SCHEDULED, BookingStatus.ACTIVE] },
        OR: [
          { startTime: { lte: start }, endTime: { gte: start } },
          { startTime: { lte: end }, endTime: { gte: end } },
          { startTime: { gte: start }, endTime: { lte: end } },
        ],
      },
    });

    if (conflicting) {
      throw new ConflictException(
        `Time slot conflict: Elevator is already booked from ${conflicting.startTime.toISOString()} to ${conflicting.endTime.toISOString()}`,
      );
    }

    return this.prisma.booking.create({
      data: {
        organisationId: dto.organisationId,
        buildingId: dto.buildingId,
        elevatorId: dto.elevatorId,
        userId: dto.userId,
        purpose: dto.purpose,
        startTime: start,
        endTime: end,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        status: BookingStatus.PENDING_APPROVAL,
      },
      include: {
        elevator: true,
        building: true,
      },
    });
  }

  async updateStatus(bookingId: string, status: BookingStatus, approverId: string, notes?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    await this.prisma.bookingApproval.create({
      data: {
        bookingId,
        approverId,
        decision: status,
        notes,
      },
    });

    return updated;
  }
}


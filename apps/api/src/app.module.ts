import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { ElevatorsModule } from './modules/elevators/elevators.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CommandsModule } from './modules/commands/commands.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { FaultsModule } from './modules/faults/faults.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { ElevatorWebSocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrganisationsModule,
    BuildingsModule,
    ElevatorsModule,
    BookingsModule,
    CommandsModule,
    MaintenanceModule,
    FaultsModule,
    ReportsModule,
    AuditModule,
    ElevatorWebSocketModule,
  ],
})
export class AppModule {}

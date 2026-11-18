import { Module } from '@nestjs/common';
import { ElevatorsService } from './elevators.service';
import { ElevatorsController } from './elevators.controller';

@Module({
  controllers: [ElevatorsController],
  providers: [ElevatorsService],
  exports: [ElevatorsService],
})
export class ElevatorsModule {}


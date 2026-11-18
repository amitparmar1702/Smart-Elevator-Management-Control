import { IOEMAdapter } from './oem-adapter.interface';
import { GenericAdapter } from './generic.adapter';
import { KONEAdapter } from './kone.adapter';
import { OtisAdapter } from './otis.adapter';
import { SchindlerAdapter } from './schindler.adapter';
import { TKElevatorAdapter } from './tk-elevator.adapter';
import { JohnsonLiftsAdapter } from './johnson.adapter';

export * from './oem-adapter.interface';
export * from './generic.adapter';
export * from './kone.adapter';
export * from './otis.adapter';
export * from './schindler.adapter';
export * from './tk-elevator.adapter';
export * from './johnson.adapter';

export class OEMAdapterRegistry {
  private static adapters: Map<string, IOEMAdapter> = new Map<string, IOEMAdapter>([
    ['GENERIC', new GenericAdapter()],
    ['KONE', new KONEAdapter()],
    ['OTIS', new OtisAdapter()],
    ['SCHINDLER', new SchindlerAdapter()],
    ['TK_ELEVATOR', new TKElevatorAdapter()],
    ['TKE', new TKElevatorAdapter()],
    ['THYSSENKRUPP', new TKElevatorAdapter()],
    ['JOHNSON_LIFTS', new JohnsonLiftsAdapter()],
    ['JOHNSON', new JohnsonLiftsAdapter()],
  ]);

  /**
   * Retrieves the appropriate OEM adapter instance for a manufacturer
   */
  public static getAdapter(manufacturer: string): IOEMAdapter {
    const key = (manufacturer || 'GENERIC').toUpperCase().replace(/\s+/g, '_');
    return this.adapters.get(key) || this.adapters.get('GENERIC')!;
  }

  /**
   * Lists all supported elevator OEM manufacturers
   */
  public static getSupportedManufacturers(): string[] {
    return Array.from(new Set(Array.from(this.adapters.values()).map((a) => a.manufacturer)));
  }
}

import { TestBed } from '@angular/core/testing';
import { PerformanceDataService } from './performance-data.service';

describe('PerformanceDataService', () => {
  let service: PerformanceDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformanceDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketModalComponent } from './ticket-modal.component';

describe('TicketModalComponent', () => {
  let component: TicketModalComponent;
  let fixture: ComponentFixture<TicketModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

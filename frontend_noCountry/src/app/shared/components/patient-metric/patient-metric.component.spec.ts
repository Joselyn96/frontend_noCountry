import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMetricComponent } from './patient-metric.component';

describe('PatientMetricComponent', () => {
  let component: PatientMetricComponent;
  let fixture: ComponentFixture<PatientMetricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientMetricComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientMetricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentActionsLeftComponent } from './document-actions-left.component';

describe('DocumentActionsComponent', () => {
  let component: DocumentActionsLeftComponent;
  let fixture: ComponentFixture<DocumentActionsLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentActionsLeftComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentActionsLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { DocumentViewerService } from '../document-viewer.service';
import { DocumentActions } from '../_config/document-actions.model';
import { DocumentConfig } from '../_config/document.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  modalStatus: boolean = false;
  subscription = new Subscription();
  @Input('document') document: DocumentComponent | undefined;
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
    containerHeight: 0,
  };
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    informationHelp: '',
    downloadPdfPlain: '',
  };
  defaultConfig: DocumentConfig = { containerWidth: 0, containerHeight: 0 };

  constructor(private docViewerService: DocumentViewerService) {}

  ngOnInit(): void {
    this.subscription = this.docViewerService.modalStatus.subscribe(
      (status) => {
        this.modalStatus = status;
      }
    );
  }

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
  }

  closeModal() {
    this.modalStatus = false;
    this.docViewerService.modalStatus.next(this.modalStatus);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

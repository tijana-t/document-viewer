import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { DocumentViewerService } from '../document-viewer.service';
import { DocumentActions } from '../_config/document-actions.model';
import { DocumentConfig, ShowDocumentConfig } from '../_config/document.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-document-actions-left',
  templateUrl: './document-actions-left.component.html',
  styleUrls: ['./document-actions-left.component.scss'],
})
export class DocumentActionsLeftComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  modalStatus: boolean = false;
  subscription = new Subscription();
  showOrginalConfig: ShowDocumentConfig = {
    showOrginal: false,
    viewPercent: 50,
  };
  @Input('document') document: DocumentComponent | undefined;
  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
  };
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    informationHelp: '',
    downloadPdfPlain: '',
  };
  @Input('editable') editable: string = '';
  @Output('downloadDocument') downloadDocumentEvent = new EventEmitter();
  defaultConfig: DocumentConfig = { containerWidth: 0 };
  constructor(private docViewerService: DocumentViewerService) {}

  ngOnInit(): void {
    this.subscription = this.docViewerService.modalStatus.subscribe(
      (status: boolean) => {
        this.modalStatus = status;
      }
    );

    this.subscription = this.docViewerService.docConfSubject.subscribe(
      (res: DocumentConfig) => {
        this.defaultConfig = res;
        if (this.showOrginalConfig.showOrginal) {
          this.changeOrginalImgSize();
        }
      }
    );
  }

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
  }

  openModal() {
    this.modalStatus = true;
    this.docViewerService.modalStatus.next(this.modalStatus);
  }

  downloadDocument() {
    this.downloadDocumentEvent.emit(true);
  }

  showOriginalDocument() {
    this.showOrginalConfig.showOrginal = !this.showOrginalConfig.showOrginal;
    const orgImageParent = document.getElementById('orgImageParent');
    this.docViewerService.showOriginalDoc.next(this.showOrginalConfig);

    if (!this.showOrginalConfig.showOrginal) {
      if (orgImageParent) {
        orgImageParent.style.width =
          Math.floor(this.defaultConfig.containerWidth) + 'px';
      }
    } else {
      if (orgImageParent) {
        orgImageParent.style.width =
          Math.floor(this.defaultConfig.containerWidth / 2) + 'px';
      }
    }
  }

  changeOrginalImgSize() {
    const orgImageParent = document.getElementById('orgImageParent');
    if (orgImageParent && this.showOrginalConfig.showOrginal) {
      orgImageParent.style.width =
        (this.defaultConfig.containerWidth *
          this.showOrginalConfig.viewPercent) /
          100 +
        'px';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentConfig'] && changes['documentConfig'].currentValue) {
      this.documentConfig = changes['documentConfig'].currentValue;
    }
    if (
      changes['documentActionsSrc'] &&
      changes['documentActionsSrc'].currentValue
    ) {
      this.documentActionsSrc = changes['documentActionsSrc'].currentValue;
    }
    if (changes['editable'] && changes['editable'].currentValue) {
      this.editable = changes['editable'].currentValue;
      console.log('actions', this.editable);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

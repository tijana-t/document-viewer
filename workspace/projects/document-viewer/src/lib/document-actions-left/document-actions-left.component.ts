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
  @Input('inProjects') inProjects: boolean = false;
  @Input('qAndAModel') qAndAModel: boolean = false;

  @Input('documentConfig') documentConfig: DocumentConfig = {
    containerWidth: 0,
  };
  @Input('documentActionsSrc') documentActionsSrc: DocumentActions = {
    informationHelp: '',
    downloadPdfPlain: '',
    exportParagraphs: '',
    downloadExcel: '',
    exportChaptersArticles: '',
  };
  @Input('editable') editable: any = null;
  @Input('singleDocument') singleDocument: any;
  @Input('isClassification') isClassification: boolean = false;
  @Input('hideButtons') hideButtons: boolean = false;

  @Input('docModel') docModel: any;
  @Input('params') params: any;
  @Output('downloadDocument')
  downloadDocumentEvent = new EventEmitter();
  @Output('downloadExcelEvent') downloadExcelEvent = new EventEmitter();
  @Output('downloadParagraphs') downloadParagraphsEvent = new EventEmitter();
  @Output('exportMonthlyStat') exportMonthlyStat = new EventEmitter();
  defaultConfig: DocumentConfig = { containerWidth: 0 };
  showDebugger = false;
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

  downloadExcel(typeOfDownload: string) {
    this.downloadExcelEvent.emit(typeOfDownload);
  }

  openDebugger() {
    this.showDebugger = !this.showDebugger;
    this.docViewerService.showDebugger.next(this.showDebugger);
  }

  ngAfterViewInit() {
    this.defaultConfig = { ...this.documentConfig };
  }

  openModal() {
    this.modalStatus = true;
    this.docViewerService.modalStatus.next(this.modalStatus);
  }

  downloadDocument() {
    this.downloadDocumentEvent.emit(false);
  }

  downloadParagraphs() {
    this.downloadParagraphsEvent.emit(false);
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
  exportMonthlyStatistic() {
    let data = {
      modelContainerId: this.docModel.modelContainerId,
      documentId: this.singleDocument.file._id,
      relation: this.inProjects ? 'ANALYSIS' : 'TRAINING',
      versionId: this.params.versionId,
    };

    console.log('vals', data);
    this.exportMonthlyStat.emit(data);
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
    if (changes['editable']) {
      this.editable = changes['editable'].currentValue;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

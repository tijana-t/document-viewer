import { Component, OnInit } from '@angular/core';
import { SearchConfig } from 'projects/pdf-viewer/src/lib/_config/search.model';

@Component({
  selector: 'lib-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent implements OnInit {
  searchDocument = '';
  config: SearchConfig = {
    containerWidth: 180,
  };
  constructor() {}

  ngOnInit(): void {}
}

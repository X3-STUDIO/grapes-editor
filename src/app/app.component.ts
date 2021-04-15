import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Whynet Content Editor';

  repositoryGUID: string;

  RepositoryID: string;
  currContactGUID: string;
  MediaType: string;

  URL: string;
  ParentID: string;
  ParentTable: string;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams['RepositoryGUID']) {
        this.repositoryGUID = queryParams['RepositoryGUID'];
        this.URL = queryParams['URL'];
        console.log("URL: "+queryParams['URL']);
        this.RepositoryID = '';
        this.currContactGUID = '';
        this.MediaType = '';
        this.ParentID = '';
        this.ParentTable = '';
      }
    });
  }
  
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class EditorService {

  constructor(private httpClient: HttpClient) { }

  getPage(repositoryGUID) {
    let URL = "http://gallery.whynetmultimedia.it";
    let galleryService = URL + '/editorProject/editor.aspx' + '?RepositoryGUID=' + repositoryGUID + '&cmd=getContent';
    //galleryService = 'http://gallery.whynetmultimedia.it/editorProject/editor.aspx?RepositoryGUID=2a89c05f-a0e7-4c56-9f99-87dfb167a461';
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.get(galleryService, { headers: httpHeaders });
  }

  postPage(data, repositoryGUID) {
    let URL = "http://gallery.whynetmultimedia.it";
    let galleryService = URL + '/editorProject/editor.aspx' + '?RepositoryGUID=' + repositoryGUID + '&cmd=setContent';
    //galleryService = 'http://gallery.whynetmultimedia.it/editorProject/editor.aspx?RepositoryGUID=2a89c05f-a0e7-4c56-9f99-87dfb167a461';
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.post(galleryService, data, { headers: httpHeaders });  // return a Observable
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

  RepositoryID: string = '';
  MediaType: string = '';
  ParentID: string = '';
  ParentTable: string = '';
  URL: string = '';
  currContactGUID: string = '';
  repositoryGUID: string = '';
  galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + this.MediaType + '&ParentID=' + this.ParentID + '&ParentTable=' + this.ParentTable + '&currContactGUID=' + this.currContactGUID + '&RepositoryGUID=' + this.repositoryGUID;
  mainDirectoryUrl = URL + '/public';

  constructor(private httpClient: HttpClient) { }

  getMainDirectory(MediaType, ParentID, ParentTable, URL, currContactGUID, repositoryGUID) {
    let galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + MediaType + '&ParentID=' + ParentID + '&ParentTable=' + ParentTable + '&currContactGUID=' + currContactGUID + '&RepositoryGUID=' + repositoryGUID;
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.get(galleryService + '&cmd=getFoldersAndFiles', { headers: httpHeaders });
  }

  getDirectories(directory, MediaType, ParentID, ParentTable, URL, currContactGUID, repositoryGUID) {
    let galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + MediaType + '&ParentID=' + ParentID + '&ParentTable=' + ParentTable + '&currContactGUID=' + currContactGUID + '&RepositoryGUID=' + repositoryGUID;
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.get(galleryService + '&cmd=getFoldersAndFiles' + '&directory=' + directory, { headers: httpHeaders });
  }

  getFileInfo(directory, file, MediaType, ParentID, ParentTable, URL, currContactGUID, repositoryGUID) {
    let galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + MediaType + '&ParentID=' + ParentID + '&ParentTable=' + ParentTable + '&currContactGUID=' + currContactGUID + '&RepositoryGUID=' + repositoryGUID;
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.get(galleryService + '&cmd=getFileInfo' + '&directory=' + directory + '&file=' + file, { headers: httpHeaders });
  }

  uploadFile(files, directory, MediaType, ParentID, ParentTable, URL, currContactGUID, repositoryGUID) {
    let galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + MediaType + '&ParentID=' + ParentID + '&ParentTable=' + ParentTable + '&currContactGUID=' + currContactGUID + '&RepositoryGUID=' + repositoryGUID;
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.post(galleryService + '&cmd=SaveFiles' + '&directory=' + directory, files, { observe: 'events', reportProgress: true });
  }

  createDirectory(directory, where, MediaType, ParentID, ParentTable, URL, currContactGUID, repositoryGUID) {
    let galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + MediaType + '&ParentID=' + ParentID + '&ParentTable=' + ParentTable + '&currContactGUID=' + currContactGUID + '&RepositoryGUID=' + repositoryGUID;
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.post(galleryService + '&cmd=CreateFolder' + '&directory=' + directory + '&where=' + where, { headers: httpHeaders });
  }

  /* saveFile(directory, MediaType, ParentID, ParentTable, URL, currContactGUID) {
    let galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + MediaType + '&ParentID=' + ParentID + '&ParentTable=' + ParentTable + '&currContactGUID=' + currContactGUID;
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.post(galleryService + '&cmd=SaveFiles' + '&directory=' + directory, { headers: httpHeaders });
  }

  saveGallery(directory, MediaType, ParentID, ParentTable, URL, currContactGUID) {
    let galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + MediaType + '&ParentID=' + ParentID + '&ParentTable=' + ParentTable + '&currContactGUID=' + currContactGUID;
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    return this.httpClient.get(galleryService + '&cmd=SaveGallery' + '&directory=' + directory, { headers: httpHeaders });
  } */

}

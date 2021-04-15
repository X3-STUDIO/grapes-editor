import { Component, OnInit, Inject, AfterViewInit, ViewChild, ElementRef, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FsElement } from './file-manager-models';
import { DatePipe } from '@angular/common'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FileManagerService } from '../file-manager.service';


@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})

export class FileManagerComponent implements OnInit {

  @Input() RepositoryID: string;
  @Input() MediaType: string;
  @Input() ParentID: string;
  @Input() ParentTable: string;
  @Input() URL: string;
  @Input() currContactGUID: string;
  @Input() RepositoryGUID: string;
  @Output() newMediaEvent = new EventEmitter<string[]>();
  //galleryService = URL + '/crossPublisher/CrossMedia/gallery.aspx' + '?MediaType=' + this.MediaType + '&ParentID=' + this.ParentID + '&ParentTable=' + this.ParentTable + '&currContactGUID=' + this.currContactGUID;

  //form: FormGroup;
  description: string;
  canInsert: boolean;

  mainDirectoryUrl = '';
  content: FsElement[] = [];
  folderPath: string[] = ['Principale'];
  position: string = '';
  infoPosition: string = '';  // position of the file displayed in info section (save that path because browsering it can change)
  infoFile: FsElement = new FsElement();

  @ViewChild('inputFile') inputFile: ElementRef;
  @ViewChild('modal') modal: ElementRef;
  progressValue: number = 0;
  uploadStatus: string = '';
  status: string = '';
  toLoad: number;
  loading: number;

  constructor(private fileManagerService: FileManagerService,
    private datePipe: DatePipe,
    private dialogRef: MatDialogRef<FileManagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    /* fileManagerService.MediaType = this.MediaType;
    fileManagerService.ParentID = this.ParentID;
    fileManagerService.ParentTable = this.ParentTable;
    fileManagerService.URL = this.URL;
    fileManagerService.currContactGUID = this.currContactGUID; */
    this.description = data.description;
    this.URL = data.url;
    console.log(this.URL);
    this.RepositoryGUID = data.repositoryGUID;
    this.canInsert = data.canInsert;
  }

  ngOnInit(): void {
    this.findContent('');
    this.mainDirectoryUrl = this.URL + '/public';
  }

  insertImage() {
    if (this.infoPosition == '')
      this.dialogRef.close({ url: this.URL + '/public/' + this.infoFile.name, image: this.isImage(this.infoFile.name) });
    else
      this.dialogRef.close({ url: this.URL + '/public' + this.infoPosition + '/' + this.infoFile.name, image: this.isImage(this.infoFile.name) });
    /*  this.dialogRef.close(this.URL + '/public' + this.infoPosition + '/' + this.infoFile.name); */
  }

  close() {
    this.dialogRef.close();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currContactGUID']) {
      //this.findContent('');
      this.mainDirectoryUrl = this.URL + '/public';
    }
  }

  findContent(directory, index = -1, refresh = false) {
    if (index != -1) {
      var exfolderPath = this.folderPath;
      if (index == exfolderPath.length - 1) {
        return;
      }
      this.folderPath = [];
      this.position = '';
      for (var i = 0; i < index; i++) {
        this.folderPath[i] = exfolderPath[i];
        if (i > 0)
          this.position = this.position + this.folderPath[i];
      }
      if (index == 0) {
        this.folderPath = ['Principale'];
        directory = '';
      }
    }
    if (directory === '') {
      console.log("GUIDA");
      console.log(this.URL);
      console.log("GUIDA");
      this.fileManagerService.getMainDirectory(this.MediaType, this.ParentID, this.ParentTable, this.URL, this.currContactGUID, this.RepositoryGUID).subscribe((response) => {
        this.position = '';
        this.content = [];
        for (let i = 0; i < response['FolderFiles'].length; i++) {
          this.content.push({
            name: response['FolderFiles'][i].Name,
            type: response['FolderFiles'][i].Type,
            date: '',
            formatName: '',
            dimension: 0
          });
        }
        this.content.sort((a, b) => (a.type > b.type) ? 1 : (a.type === b.type) ? ((a.name > b.name) ? 1 : -1) : -1);
      });
    }
    else {
      if (!refresh) {
        this.folderPath.push(directory);
        this.position = this.position + '/' + directory;
      }
      this.content = [];
      this.fileManagerService.getDirectories(this.position, this.MediaType, this.ParentID, this.ParentTable, this.URL, this.currContactGUID, this.RepositoryGUID).subscribe((response) => {
        for (let i = 0; i < response['FolderFiles'].length; i++) {
          this.content.push({
            name: response['FolderFiles'][i].Name,
            type: response['FolderFiles'][i].Type,
            date: '',
            formatName: '',
            dimension: 0
          });
        }
        this.content.sort((a, b) => (a.type > b.type) ? 1 : (a.type === b.type) ? ((a.name > b.name) ? 1 : -1) : -1);
      });
    }
    //this.currentFile.name = '';
  }

  findFileInfo(filename) {
    this.infoPosition = this.position;
    this.fileManagerService.getFileInfo(this.infoPosition, filename, this.MediaType, this.ParentID, this.ParentTable, this.URL, this.currContactGUID, this.RepositoryGUID)
      .subscribe(
        response => {
          this.infoFile.name = filename;
          this.infoFile.type = 'file';
          this.infoFile.date = this.datePipe.transform(response['CreationTime'], 'dd/MM/yy, HH:mm');
          this.infoFile.formatName = response['Name'];
          this.infoFile.dimension = parseInt(response['Length']) * 0.000977;
        },
        error => {
          console.log(error);
        });
  }

  sendMultipleFiles() {
    this.loading = 1;
    this.toLoad = this.inputFile.nativeElement.files.length;
    for (let i = 0; i < this.inputFile.nativeElement.files.length; i++) {
      this.sendFile(i);
    }
  }

  sendFile(i) {
    let file: File = this.inputFile.nativeElement.files[i];
    let formData = new FormData();
    formData.append("file", file);
    this.fileManagerService.uploadFile(formData, this.position, this.MediaType, this.ParentID, this.ParentTable, this.URL, this.currContactGUID, this.RepositoryGUID).subscribe(event => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          console.log('Uploading....');
          let progressPercent = (event.loaded / event.total) * 100;
          this.progressValue = Math.round(progressPercent);
          this.uploadStatus = "Uploaded " + event.loaded + " bytes of " + event.total;
          break;
        case HttpEventType.Response:
          this.loading = this.loading + 1;
          console.log('Response', event.status, event.body);
          this.status = JSON.stringify(event.body);
          this.findContent(this.position, -1, true); // to refresh the folder content
          break;
        default:
          return `File "x" surprising upload event: ${event.type}.`;
      }
    },
      error => {
        console.log(error);
      });
  }

  createFolder(directory) {
    console.log(this.currContactGUID);
    this.fileManagerService.createDirectory(directory, this.position, this.MediaType, this.ParentID, this.ParentTable, this.URL, this.currContactGUID, this.RepositoryGUID).subscribe(response => {
      this.findContent(this.position, -1, true); // to refresh the folder content
    },
      error => {
        console.log(error);
      });
  }

  addFile(folder: string, file: string) {
    //console.log(folder+'/'+file);
    var path = [folder, file];
    this.newMediaEvent.emit(path);
  }

  /* Check if a file is an image or not */
  isImage(filename: string) {
    let extension = filename.split('.').pop().toLowerCase();
    if (extension == "psd" || extension == "xcf" || extension == "ai" || extension == "cdr")
      return true;
    else if (extension == "jpg" || extension == "jpeg" || extension == "gif" || extension == "png" || extension == "eps")
      return true;
    else if (extension == "tif" || extension == "tiff" || extension == "bmp" || extension == "raw" || extension == "cr2")
      return true;
    else
      return false;
  }

  /* Check if a file could be dangerous */
  isDangerousFile(filename: string) {
    let extension = filename.split('.').pop().toLowerCase();
    if (extension == "exe" || extension == "pif" || extension == "bat" || extension == "xap")
      return true;
    else
      return false;
  }

  /* Return the correct icon image corresponding to the file extension */
  getExtensionIconImage(filename: string) {
    switch (filename.split('.').pop()) {
      case "pdf":
        return "icon-pdf.png";
      case "xls":
        return "icon-excell.png";
      case "xlsx":
        return "icon-excell.png";
      case "doc":
        return "icon-word.png";
      case "docx":
        return "icon-word.png";
      default:
        return "icon-file.jpg";
    }
  }

  copyUrl() {
    this.dialogRef.close();
  }

}

import { Component, OnInit, OnChanges, AfterContentInit, AfterViewInit, AfterContentChecked, AfterViewChecked, Inject, ViewChild, ElementRef, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import grapesjs from 'node_modules/grapesjs';
import it from 'grapesjs/locale/it';
import 'node_modules/grapesjs-blocks-basic';
import 'node_modules/grapesjs-preset-webpage';
import 'node_modules/grapesjs-preset-newsletter';
import 'node_modules/grapesjs-table';
//import 'node_modules/grapesjs-plugin-ckeditor';
import CKEDITOR from 'node_modules/grapesjs-plugin-ckeditor/dist/grapesjs-plugin-ckeditor.min.js';

import { EditorService } from '../editor.service';
import { FileManagerComponent } from '../file-manager/file-manager.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  providers: [EditorService]
})

export class EditorComponent implements OnInit, OnChanges, AfterContentInit, AfterViewInit {

  @Input() RepositoryID: string;
  @Input() MediaType: string;
  @Input() ParentID: string;
  @Input() ParentTable: string;
  @Input() URL: string;
  @Input() currContactGUID: string;
  @Input() repositoryGUID: string;

  editor: any;
  SimpleStorage = {};
  imageUrl: string;
  currentImage: any;

  constructor(private editorService: EditorService,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog) {
  }

  ngOnInit(): void {
    /* if (this.repositoryGUID != null)
      this.loadPage(); */
      console.log('CKEDITOR');
      //console.log(CKEDITOR);
  }

  ngAfterContentInit(): void {
    this.editor = grapesjs.init({
      container: '#gjs',
      i18n: {
        locale: 'it',
        messages: { it },
      },
      plugins: ['gjs-preset-newsletter', 'gjs-blocks-basic', 'gjs-plugin-ckeditor'],  //'gjs-preset-webpage', 'grapesjs-table'
      pluginsOpts: {
        'gjs-blocks-basic': {
          blocks: ['column1', 'column2', 'column3', 'column3-7', 'video'], ///, 'map'
        },
        'gjs-plugin-ckeditor' : {},
      },
      storageManager: {
        type: 'custom-storage', //remote
        id: '',
        autosave: false,
        autoload: false,
        setStepsBeforeSave: 1,
        contentTypeJson: true,
        //urlStore: 'http://gallery.whynetmultimedia.it/editorProject/editor.aspx?RepositoryGUID=' + this.repositoryGUID + '&cmd=setContent',
        //urlLoad: 'http://gallery.whynetmultimedia.it/editorProject/editor.aspx?RepositoryGUID=' + this.repositoryGUID + '&cmd=getContent',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          'Access-Control-Allow-Origin': 'http://localhost:4200',
        },
      },
      
    });

    this.editor.StorageManager.add('custom-storage', {

      load: (keys, clb, clbErr) => {
        const result = {};
        keys.forEach(key => {
          const value = this.SimpleStorage[key];
          if (value) {
            result[key] = value;
          }
        });
        clb(result); // Might be called inside some async method */
      },

      store: (data, clb, clbErr) => {
        for (let key in data) {
          this.SimpleStorage[key] = data[key];
        }
        this.SimpleStorage['content'] = this.getHtmlwithCss();
        this.storePage(this.SimpleStorage);
        clb(); // Might be called inside some async method
      }
    });

    this.editor.setCustomRte({
      enable: function(el, rte) {
          // If already exists just focus
          if (rte) {
              this.focus(el, rte); // implemented later
              return rte;
          }
          // CKEditor initialization
          /* rte = CKEDITOR.inline(el, {
              // Your configurations...
              toolbar: [
                  { name: 'styles', items: ['Font', 'FontSize' ] },
                  ['Bold', 'Italic', 'Underline', 'Strike'],
                  {name: 'paragraph', items : [ 'NumberedList', 'BulletedList']},
                  {name: 'links', items: ['Link', 'Unlink']},
                  {name: 'colors', items: [ 'TextColor', 'BGColor' ]},
              ],
              uiColor: '#9AB8F3', // Inline editor color
              startupFocus: true,
              extraAllowedContent: '*(*);*{*}', // Allows any class and any inline style
              allowedContent: true, // Disable auto-formatting, class removing, etc.
              enterMode: CKEDITOR.ENTER_BR,
              // extraPlugins: 'sharedspace,justify,colorbutton,panelbutton,font',
              
              // sharedSpaces: {
              //  top: editor.RichTextEditor.getToolbarEl(),
              // }
          }); */
      
          this.focus(el, rte); // implemented later
          return rte;
      },
      focus(el, rte) {
          // Do nothing if already focused
          if (rte && rte.focusManager.hasFocus) {
              return;
          }
          el.contentEditable = true;
          rte && rte.focus();
      },
      disable(el, rte) {
          el.contentEditable = false;
          if (rte && rte.focusManager)
              rte.focusManager.blur(true);
      }
  });

    this.setGrapesJsButtons();
    this.setGrapesJsBlocks();
    this.createTableComponent();
  }

  ngAfterViewInit(): void {
    this.loadPage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['repositoryGUID']) {
      this.loadPage();
    }
    /* if (changes['SimpleStorage']) {
      this.loadPage();
    } */
  }

  /* Return the html merged with the css inline */
  getHtmlwithCss(): string {
    var htmlWithCss = this.editor.runCommand('gjs-get-inlined-html');
    return htmlWithCss;
  }

  /* Load the existing page associated with the request page */
  loadPage() {
    this.editorService.getPage(this.repositoryGUID).subscribe((response) => {
      this.SimpleStorage = response;
      this.editor.load(res => console.log('Load callback', res));
    },
      error => {
        console.log(error);
      });
  }

  /* Save the current page */
  storePage(page) {
    this.editorService.postPage(page, this.repositoryGUID).subscribe((response) => {
      this.openSnackBar('Pagina salvata con successo!', '', 'green');
    },
      error => {
        console.log(error);
        this.openSnackBar('In salvataggio NON è andatato a buon fine!', '', 'red');
      });
  }

  openSnackBar(message: string, action: string, color: string) {
    this._snackBar.open(message, action, {
      duration: 2000, panelClass: [color],
    });
  }

  openDialog(canInsert: boolean) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '100%';
    dialogConfig.data = {
      id: 1,
      url: this.URL,
      repositoryGUID: this.repositoryGUID,
      canInsert: canInsert,
    };
    dialogConfig.panelClass = 'assets-panel';

    const dialogRef = this._dialog.open(FileManagerComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.imageUrl = result.url;
        if (this.imageUrl != undefined) {
          if (result.image)
            this.currentImage.set('src', this.imageUrl);
          else {
            this.currentImage['attributes']['href'] = this.imageUrl;
          }
        }
      }
    });
  }

  setGrapesJsButtons() {
    this.editor.Panels.removeButton('options', 'gjs-toggle-images');
    this.editor.Panels.removeButton('options', 'gjs-open-import-template');
    //this.editor.Panels.removeButton('options', 'export-template');
    //this.editor.Panels.removeButton("views", "open-layers");
    //this.editor.Panels.removeButton("views", "open-sm");
    //this.editor.Panels.removeButton("views", "open-blocks");
    //this.editor.Panels.removeButton("views", "open-tm");

    this.editor.Panels.addButton('options', [{
      id: 'media',
      className: 'fa fa-folder-o icon-blank',
      //command: (editor1, sender) => { this.editor.store(res => console.log('Store callback')); },
      //command: this.storePage(this.SimpleStorage),
      command: (editor1, sender) => { this.openDialog(false); },
      attributes: { title: 'Apri Media Gallery' },
    },]);

    this.editor.Panels.addButton('options', [{
      id: 'save',
      className: 'fa fa-floppy-o icon-blank',
      command: (editor1, sender) => { this.editor.store(res => console.log('Store callback')); },
      //command: this.storePage(this.SimpleStorage),
      attributes: { title: 'Salva pagina' }
    },]);

    this.editor.Panels.getButton('views', 'open-blocks').set('open', true);

    this.editor.on('block:drag:stop', model => {
      //console.log(model);
      if (model.length >= 2) {
        model = model[0];
      }
      if (model.attributes.type == 'video') {
        model.attributes.src = '';
      }
      this.editor.select(model);
    });

    const sm = this.editor.StyleManager;
    this.editor.on('component:selected', model => {
      console.log(model);
      if (model.length >= 2) {
        model = model[0];
      }
      if (model.attributes.type == 'link') {  // model.getName() == 'Link'
        sm.getSector('dimension').set('open', false);
        sm.getSector('typography').set('open', true);
        if (model.attributes.attributes.href == '') {
          const openTmBtn = this.editor.Panels.getButton('views', 'open-tm');
          openTmBtn.set('active', true);
        }
        else {
          const openSmBtn = this.editor.Panels.getButton('views', 'open-sm');
          openSmBtn.set('active', true);
        }
      }
      else if (model.attributes.type == 'video') {  // model.getName() == 'Link'
        sm.getSector('dimension').set('open', true);
        sm.getSector('typography').set('open', false);
        if (model.attributes.src == '' || model.attributes.videoId == '') {
          const openTmBtn = this.editor.Panels.getButton('views', 'open-tm');
          openTmBtn.set('active', true);
        }
        else {
          const openSmBtn = this.editor.Panels.getButton('views', 'open-sm');
          openSmBtn.set('active', true);
        }
      }
      else if (model.attributes.type == 'text') {  //model.getName() == 'Testo'
        const openSmBtn = this.editor.Panels.getButton('views', 'open-sm');
        openSmBtn.set('active', true);
        sm.getSector('dimension').set('open', false);
        sm.getSector('typography').set('open', true);
      }
      else if (model.attributes.type == 'link-block') {
        const openTmBtn = this.editor.Panels.getButton('views', 'open-tm');
        openTmBtn.set('active', true);
        sm.getSector('dimension').set('open', true);
        sm.getSector('typography').set('open', false);
      }
      else {
        const openSmBtn = this.editor.Panels.getButton('views', 'open-sm');
        openSmBtn.set('active', true);
        sm.getSector('dimension').set('open', true);
        sm.getSector('typography').set('open', false);
      }
    });

    this.editor.Commands.add('open-assets', {
      run: (editor, sender, opts = {}) => {
        this.openDialog(true);
        this.currentImage = editor.getSelected(); //.set('src', this.imageUrl);
        this.currentImage = opts['target'];
      }
    });
  }

  setGrapesJsBlocks() {
    const bm = this.editor.BlockManager;
    const column1 = bm.get('column1').set({ label: 'Sezione 100', category: '', attributes: { class: 'gjs-fonts gjs-f-b1 order1' }, });
    const column2 = bm.get('column2').set({ label: 'Sezioni 50/50', category: '', attributes: { class: 'gjs-fonts gjs-f-b2 order2' }, });
    const column3 = bm.get('column3').set({ label: 'Sezioni 30/30/30', category: '', attributes: { class: 'gjs-fonts gjs-f-b3 order3' }, });
    const column37 = bm.get('column3-7').set({ label: 'Sezioni 30/70', category: '', attributes: { class: 'gjs-fonts gjs-f-b37 order4' }, });
    const s100Block = bm.get('sect100').set({ label: 'Sezione 100', order: 1, });
    bm.remove('sect100');
    const s50Block = bm.get('sect50').set({ label: 'Sezioni 50/50', order: 2, });
    bm.remove('sect50');
    const s30Block = bm.get('sect30').set({ label: 'Sezioni 30/30/30', order: 3, });
    bm.remove('sect30');
    const s37Block = bm.get('sect37').set({ label: 'Sezioni 30/70', order: 4, });
    bm.remove('sect37');
    const dividerBlock = bm.get('divider').set({ label: 'Divisorio', order: 8, });
    bm.remove('divider');
    const textBlock = bm.get('text').set({ label: 'Testo', category: '', attributes: { class: 'gjs-fonts gjs-f-text order5' }, });
    const textsectBlock = bm.get('text-sect').set({ label: 'Titolo + Testo', category: '', attributes: { class: 'gjs-fonts gjs-f-h1p order6' }, });
    const imageBlock = bm.get('image').set({ label: 'Immagine', category: '', attributes: { class: 'gjs-fonts gjs-f-image order7' }, });
    //imageBlock.set({ content: '<img src="" class="custom-image" style="width: 20%; height: auto;">' });
    const video = bm.get('video').set({
      label: 'Video', category: '', attributes: { class: 'fa fa-youtube-play  order8' },
      content: {
        type: 'video',
        provider: 'yt', // this line will do the trick
        videoId: '', // you can even set a default video, put youtube video id here
        src: '',
        style: {
          height: '350px',
          width: '615px',
        },
      }
    });
    const linkblockBlock = bm.get('link-block').set({ label: 'Blocco Link', category: '', attributes: { class: 'fa fa-link order10' }, });
    const gridBlock = bm.get('grid-items').set({ label: 'Griglia', order: 11, });
    bm.remove('grid-items');
    const listBlock = bm.get('list-items').set({ label: 'Lista', order: 12, });
    bm.remove('list-items');
    const quoteBlock = bm.get('quote').set({ label: 'Citazione', order: 13, });
    bm.remove('quote');
    const buttonBlock = bm.get('button').set({ label: 'Bottone', category: '', attributes: { class: 'gjs-fonts gjs-f-button order11' }, });
    buttonBlock.set({ content: '<button class="btn"><a style="text-decoration:none" href="">Bottone<a></button>' });

    var domComps = this.editor.DomComponents;
    var dType = domComps.getType('link');
    var dModel = dType.model;
    var dView = dType.view;
    domComps.addType('link', {
      model: dModel.extend(
        {
          init() {
            dModel.prototype.init.apply(this, arguments);
            this.listenTo(this, 'change:provider', this.updateTypeTraits);
            var typeTrait = this.get('traits').find(el => el.get('name') == 'type');
            if (!typeTrait) {
              typeTrait = this.get('traits').add({
                type: 'checkbox',
                label: 'Scaricabile',
                name: 'download',
              });
            }
            this.on('change:attributes:download', this.handleTypeChange);
          },
          handleTypeChange() {
            console.log('download type changed to: ', this.getAttributes().download);
          },
          updateTraits() {
            var traits = this.getSourceTraits();
            traits.push({
              type: 'checkbox',
              label: 'Scaricabile',
              name: 'download',
            });
            this.loadTraits(traits);
            this.em.trigger('component:toggled');
          },
        }),
      view: dView,
    });

    const linkBlock = bm.get('link').set({ label: 'Link', category: '', attributes: { class: 'fa fa-link order9', download: 'download' }, });
    linkBlock.set({ content: '<a href="">Link</a>' });

  }

  createTableComponent() {
    const bm = this.editor.BlockManager;
    bm.add('table-block', {
      id: 'table',
      label: 'Tabella',
      category: '',
      attributes: { class: 'fa fa-table order13' },
      content: `
          <table class="table table-bordered table-resizable">
              <tr><td>Cella</td><td>Cella</td><td>Cella</td></tr>
              <tr><td>Cella</td><td>Cella</td><td>Cella</td></tr>
              <tr><td>Cella</td><td>Cella</td><td>Cella</td></tr>
          </table>
        `,
    });
    const TOOLBAR_CELL = [
      {
        attributes: { class: "fa fa-arrows" },
        command: "tlb-move"
      },
      {
        attributes: { class: "fa fa-plus" },
        command: "table-insert-row-above"
      },

      {
        attributes: { class: 'fa fa-clone' },
        command: 'tlb-clone',
      },
      {
        attributes: { class: 'fa fa-trash-o' },
        command: 'tlb-delete',
      }
    ];
    const getCellToolbar = () => TOOLBAR_CELL;


    const components = this.editor.DomComponents;
    const text = components.getType('text');
    components.addType('cell', {
      model: text.model.extend({
        defaults: Object.assign({}, text.model.prototype.defaults, {
          type: 'cell',
          tagName: 'td',
          draggable: ['tr'],

        }),
      },

        {
          isComponent(el) {
            let result;
            const tag = el.tagName;
            if (tag == 'TD' || tag == 'TH') {
              result = {
                type: 'cell',
                tagName: tag.toLowerCase()
              };
            }
            return result;
          }
        }),
      view: text.view,
    });

    this.editor.on('component:selected', m => {
      const compType = m.get('type');
      switch (compType) {
        case 'table':
          m.set('toolbar', getCellToolbar()); // set a toolbars
      }
    });

    this.editor.Commands.add('table-insert-row-above', editor => {
      const selected = editor.getSelected();

      if (selected.is('table')) {
        const rowComponent = selected.parent();
        const rowIndex = rowComponent.collection.indexOf(rowComponent);
        const cells = rowComponent.components().length;
        const rowContainer = rowComponent.parent();

        rowContainer.components().add({
          type: 'row',
          components: [...Array(cells).keys()].map(i => ({
            type: 'cell',
            content: 'New Cell',
          }))
        }, { at: rowIndex });
      }
    });
    const tableBlock = bm.get('table-block');

  }

}

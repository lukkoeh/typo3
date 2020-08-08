/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","./Enum/Severity","./Utility/MessageUtility","moment","nprogress","TYPO3/CMS/Core/Ajax/AjaxRequest","./Modal","./Notification"],(function(e,t,i,s,a,o,r,l,d,n){"use strict";var p;Object.defineProperty(t,"__esModule",{value:!0}),i=__importDefault(i),o=__importDefault(o),function(e){e.OVERRIDE="replace",e.RENAME="rename",e.SKIP="cancel",e.USE_EXISTING="useExisting"}(p||(p={}));class h{constructor(e){this.askForOverride=[],this.percentagePerFile=1,this.hideDropzone=e=>{e.stopPropagation(),e.preventDefault(),this.$dropzone.hide()},this.dragFileIntoDocument=e=>(e.stopPropagation(),e.preventDefault(),i.default(e.currentTarget).addClass("drop-in-progress"),this.showDropzone(),!1),this.dragAborted=e=>(e.stopPropagation(),e.preventDefault(),i.default(e.currentTarget).removeClass("drop-in-progress"),!1),this.ignoreDrop=e=>(e.stopPropagation(),e.preventDefault(),this.dragAborted(e),!1),this.handleDrop=e=>{this.ignoreDrop(e),this.processFiles(e.originalEvent.dataTransfer.files),this.$dropzone.removeClass("drop-status-ok")},this.fileInDropzone=()=>{this.$dropzone.addClass("drop-status-ok")},this.fileOutOfDropzone=()=>{this.$dropzone.removeClass("drop-status-ok")},this.$body=i.default("body"),this.$element=i.default(e);const t=void 0!==this.$element.data("dropzoneTrigger");this.$trigger=i.default(this.$element.data("dropzoneTrigger")),this.defaultAction=this.$element.data("defaultAction")||p.SKIP,this.$dropzone=i.default("<div />").addClass("dropzone").hide(),this.irreObjectUid=this.$element.data("fileIrreObject");const s=this.$element.data("dropzoneTarget");this.irreObjectUid&&0!==this.$element.nextAll(s).length?(this.dropZoneInsertBefore=!0,this.$dropzone.insertBefore(s)):(this.dropZoneInsertBefore=!1,this.$dropzone.insertAfter(s)),this.$dropzoneMask=i.default("<div />").addClass("dropzone-mask").appendTo(this.$dropzone),this.fileInput=document.createElement("input"),this.fileInput.setAttribute("type","file"),this.fileInput.setAttribute("multiple","multiple"),this.fileInput.setAttribute("name","files[]"),this.fileInput.classList.add("upload-file-picker"),this.$body.append(this.fileInput),this.$fileList=i.default(this.$element.data("progress-container")),this.fileListColumnCount=i.default("thead tr:first th",this.$fileList).length,this.filesExtensionsAllowed=this.$element.data("file-allowed"),this.fileDenyPattern=this.$element.data("file-deny-pattern")?new RegExp(this.$element.data("file-deny-pattern"),"i"):null,this.maxFileSize=parseInt(this.$element.data("max-file-size"),10),this.target=this.$element.data("target-folder"),this.browserCapabilities={fileReader:"undefined"!=typeof FileReader,DnD:"draggable"in document.createElement("span"),Progress:"upload"in new XMLHttpRequest},this.browserCapabilities.DnD?(this.$body.on("dragover",this.dragFileIntoDocument),this.$body.on("dragend",this.dragAborted),this.$body.on("drop",this.ignoreDrop),this.$dropzone.on("dragenter",this.fileInDropzone),this.$dropzoneMask.on("dragenter",this.fileInDropzone),this.$dropzoneMask.on("dragleave",this.fileOutOfDropzone),this.$dropzoneMask.on("drop",e=>this.handleDrop(e)),this.$dropzone.prepend('<div class="dropzone-hint"><div class="dropzone-hint-media"><div class="dropzone-hint-icon"></div></div><div class="dropzone-hint-body"><h3 class="dropzone-hint-title">'+TYPO3.lang["file_upload.dropzonehint.title"]+'</h3><p class="dropzone-hint-message">'+TYPO3.lang["file_upload.dropzonehint.message"]+"</p></div></div>").click(()=>{this.fileInput.click()}),i.default("<span />").addClass("dropzone-close").click(this.hideDropzone).appendTo(this.$dropzone),0===this.$fileList.length&&(this.$fileList=i.default("<table />").attr("id","typo3-filelist").addClass("table table-striped table-hover upload-queue").html("<tbody></tbody>").hide(),this.dropZoneInsertBefore?this.$fileList.insertAfter(this.$dropzone):this.$fileList.insertBefore(this.$dropzone),this.fileListColumnCount=7),this.fileInput.addEventListener("change",()=>{this.processFiles(Array.apply(null,this.fileInput.files))}),this.bindUploadButton(!0===t?this.$trigger:this.$element)):console.warn("Browser has no Drag and drop capabilities; cannot initialize DragUploader")}showDropzone(){this.$dropzone.show()}processFiles(e){this.queueLength=e.length,this.$fileList.is(":visible")||this.$fileList.show(),r.start(),this.percentagePerFile=1/e.length;const t=[];Array.from(e).forEach(e=>{const i=new l(TYPO3.settings.ajaxUrls.file_exists).withQueryArguments({fileName:e.name,fileTarget:this.target}).get({cache:"no-cache"}).then(async t=>{const i=await t.resolve();void 0!==i.uid?(this.askForOverride.push({original:i,uploaded:e,action:this.irreObjectUid?p.USE_EXISTING:p.SKIP}),r.inc(this.percentagePerFile)):new u(this,e,p.SKIP)});t.push(i)}),Promise.all(t).then(()=>{this.drawOverrideModal(),r.done()}),this.fileInput.value=""}bindUploadButton(e){e.click(e=>{e.preventDefault(),this.fileInput.click(),this.showDropzone()})}decrementQueueLength(){this.queueLength>0&&(this.queueLength--,0===this.queueLength&&new l(TYPO3.settings.ajaxUrls.flashmessages_render).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();for(let e of t)n.showMessage(e.title,e.message,e.severity)}))}drawOverrideModal(){const e=Object.keys(this.askForOverride).length;if(0===e)return;const t=i.default("<div/>").append(i.default("<p/>").text(TYPO3.lang["file_upload.existingfiles.description"]),i.default("<table/>",{class:"table"}).append(i.default("<thead/>").append(i.default("<tr />").append(i.default("<th/>"),i.default("<th/>").text(TYPO3.lang["file_upload.header.originalFile"]),i.default("<th/>").text(TYPO3.lang["file_upload.header.uploadedFile"]),i.default("<th/>").text(TYPO3.lang["file_upload.header.action"])))));for(let s=0;s<e;++s){const e=i.default("<tr />").append(i.default("<td />").append(""!==this.askForOverride[s].original.thumbUrl?i.default("<img />",{src:this.askForOverride[s].original.thumbUrl,height:40}):i.default(this.askForOverride[s].original.icon)),i.default("<td />").html(this.askForOverride[s].original.name+" ("+g.fileSizeAsString(this.askForOverride[s].original.size)+")<br>"+o.default(this.askForOverride[s].original.mtime).format("YYYY-MM-DD HH:mm")),i.default("<td />").html(this.askForOverride[s].uploaded.name+" ("+g.fileSizeAsString(this.askForOverride[s].uploaded.size)+")<br>"+o.default(this.askForOverride[s].uploaded.lastModified?this.askForOverride[s].uploaded.lastModified:this.askForOverride[s].uploaded.lastModifiedDate).format("YYYY-MM-DD HH:mm")),i.default("<td />").append(i.default("<select />",{class:"form-control t3js-actions","data-override":s}).append(this.irreObjectUid?i.default("<option/>").val(p.USE_EXISTING).text(TYPO3.lang["file_upload.actions.use_existing"]):"",i.default("<option />",{selected:this.defaultAction===p.SKIP}).val(p.SKIP).text(TYPO3.lang["file_upload.actions.skip"]),i.default("<option />",{selected:this.defaultAction===p.RENAME}).val(p.RENAME).text(TYPO3.lang["file_upload.actions.rename"]),i.default("<option />",{selected:this.defaultAction===p.OVERRIDE}).val(p.OVERRIDE).text(TYPO3.lang["file_upload.actions.override"]))));t.find("table").append("<tbody />").append(e)}const a=d.confirm(TYPO3.lang["file_upload.existingfiles.title"],t,s.SeverityEnum.warning,[{text:i.default(this).data("button-close-text")||TYPO3.lang["file_upload.button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:i.default(this).data("button-ok-text")||TYPO3.lang["file_upload.button.continue"]||"Continue with selected actions",btnClass:"btn-warning",name:"continue"}],["modal-inner-scroll"]);a.find(".modal-dialog").addClass("modal-lg"),a.find(".modal-footer").prepend(i.default("<span/>").addClass("form-inline").append(i.default("<label/>").text(TYPO3.lang["file_upload.actions.all.label"]),i.default("<select/>",{class:"form-control t3js-actions-all"}).append(i.default("<option/>").val("").text(TYPO3.lang["file_upload.actions.all.empty"]),this.irreObjectUid?i.default("<option/>").val(p.USE_EXISTING).text(TYPO3.lang["file_upload.actions.all.use_existing"]):"",i.default("<option/>",{selected:this.defaultAction===p.SKIP}).val(p.SKIP).text(TYPO3.lang["file_upload.actions.all.skip"]),i.default("<option/>",{selected:this.defaultAction===p.RENAME}).val(p.RENAME).text(TYPO3.lang["file_upload.actions.all.rename"]),i.default("<option/>",{selected:this.defaultAction===p.OVERRIDE}).val(p.OVERRIDE).text(TYPO3.lang["file_upload.actions.all.override"]))));const r=this;a.on("change",".t3js-actions-all",(function(){const e=i.default(this).val();""!==e?a.find(".t3js-actions").each((t,s)=>{const a=i.default(s),o=parseInt(a.data("override"),10);a.val(e).prop("disabled","disabled"),r.askForOverride[o].action=a.val()}):a.find(".t3js-actions").removeProp("disabled")})).on("change",".t3js-actions",(function(){const e=i.default(this),t=parseInt(e.data("override"),10);r.askForOverride[t].action=e.val()})).on("button.clicked",(function(e){"cancel"===e.target.name?(r.askForOverride=[],d.dismiss()):"continue"===e.target.name&&(i.default.each(r.askForOverride,(e,t)=>{t.action===p.USE_EXISTING?g.addFileToIrre(r.irreObjectUid,t.original):t.action!==p.SKIP&&new u(r,t.uploaded,t.action)}),r.askForOverride=[],d.dismiss())})).on("hidden.bs.modal",()=>{this.askForOverride=[]})}}class u{constructor(e,t,s){if(this.dragUploader=e,this.file=t,this.override=s,this.$row=i.default("<tr />").addClass("upload-queue-item uploading"),this.$iconCol=i.default("<td />").addClass("col-icon").appendTo(this.$row),this.$fileName=i.default("<td />").text(t.name).appendTo(this.$row),this.$progress=i.default("<td />").attr("colspan",this.dragUploader.fileListColumnCount-2).appendTo(this.$row),this.$progressContainer=i.default("<div />").addClass("upload-queue-progress").appendTo(this.$progress),this.$progressBar=i.default("<div />").addClass("upload-queue-progress-bar").appendTo(this.$progressContainer),this.$progressPercentage=i.default("<span />").addClass("upload-queue-progress-percentage").appendTo(this.$progressContainer),this.$progressMessage=i.default("<span />").addClass("upload-queue-progress-message").appendTo(this.$progressContainer),0===i.default("tbody tr.upload-queue-item",this.dragUploader.$fileList).length?(this.$row.prependTo(i.default("tbody",this.dragUploader.$fileList)),this.$row.addClass("last")):this.$row.insertBefore(i.default("tbody tr.upload-queue-item:first",this.dragUploader.$fileList)),this.$iconCol.html('<span class="t3-icon t3-icon-mimetypes t3-icon-other-other">&nbsp;</span>'),this.dragUploader.maxFileSize>0&&this.file.size>this.dragUploader.maxFileSize)this.updateMessage(TYPO3.lang["file_upload.maxFileSizeExceeded"].replace(/\{0\}/g,this.file.name).replace(/\{1\}/g,g.fileSizeAsString(this.dragUploader.maxFileSize))),this.$row.addClass("error");else if(this.dragUploader.fileDenyPattern&&this.file.name.match(this.dragUploader.fileDenyPattern))this.updateMessage(TYPO3.lang["file_upload.fileNotAllowed"].replace(/\{0\}/g,this.file.name)),this.$row.addClass("error");else if(this.checkAllowedExtensions()){this.updateMessage("- "+g.fileSizeAsString(this.file.size));const e=new FormData;e.append("data[upload][1][target]",this.dragUploader.target),e.append("data[upload][1][data]","1"),e.append("overwriteExistingFiles",this.override),e.append("redirect",""),e.append("upload_1",this.file);const t=new XMLHttpRequest;t.onreadystatechange=()=>{t.readyState===XMLHttpRequest.DONE&&(200===t.status?this.uploadSuccess(JSON.parse(t.responseText)):this.uploadError(t))},t.upload.addEventListener("progress",e=>this.updateProgress(e)),t.open("POST",TYPO3.settings.ajaxUrls.file_process),t.send(e)}else this.updateMessage(TYPO3.lang["file_upload.fileExtensionExpected"].replace(/\{0\}/g,this.dragUploader.filesExtensionsAllowed)),this.$row.addClass("error")}updateMessage(e){this.$progressMessage.text(e)}removeProgress(){this.$progress&&this.$progress.remove()}uploadStart(){this.$progressPercentage.text("(0%)"),this.$progressBar.width("1%"),this.dragUploader.$trigger.trigger("uploadStart",[this])}uploadError(e){this.updateMessage(TYPO3.lang["file_upload.uploadFailed"].replace(/\{0\}/g,this.file.name));const t=i.default(e.responseText);t.is("t3err")?this.$progressPercentage.text(t.text()):this.$progressPercentage.text("("+e.statusText+")"),this.$row.addClass("error"),this.dragUploader.decrementQueueLength(),this.dragUploader.$trigger.trigger("uploadError",[this,e])}updateProgress(e){const t=Math.round(e.loaded/e.total*100)+"%";this.$progressBar.outerWidth(t),this.$progressPercentage.text(t),this.dragUploader.$trigger.trigger("updateProgress",[this,t,e])}uploadSuccess(e){e.upload&&(this.dragUploader.decrementQueueLength(),this.$row.removeClass("uploading"),this.$fileName.text(e.upload[0].name),this.$progressPercentage.text(""),this.$progressMessage.text("100%"),this.$progressBar.outerWidth("100%"),e.upload[0].icon&&this.$iconCol.html('<a href="#" class="t3js-contextmenutrigger" data-uid="'+e.upload[0].id+'" data-table="sys_file">'+e.upload[0].icon+"&nbsp;</span></a>"),this.dragUploader.irreObjectUid?(g.addFileToIrre(this.dragUploader.irreObjectUid,e.upload[0]),setTimeout(()=>{this.$row.remove(),0===i.default("tr",this.dragUploader.$fileList).length&&(this.dragUploader.$fileList.hide(),this.dragUploader.$trigger.trigger("uploadSuccess",[this,e]))},3e3)):setTimeout(()=>{this.showFileInfo(e.upload[0]),this.dragUploader.$trigger.trigger("uploadSuccess",[this,e])},3e3))}showFileInfo(e){this.removeProgress();for(let e=7;e<this.dragUploader.fileListColumnCount;e++)i.default("<td />").text("").appendTo(this.$row);i.default("<td />").text(e.extension.toUpperCase()).appendTo(this.$row),i.default("<td />").text(e.date).appendTo(this.$row),i.default("<td />").text(g.fileSizeAsString(e.size)).appendTo(this.$row);let t="";e.permissions.read&&(t+='<strong class="text-danger">'+TYPO3.lang["permissions.read"]+"</strong>"),e.permissions.write&&(t+='<strong class="text-danger">'+TYPO3.lang["permissions.write"]+"</strong>"),i.default("<td />").html(t).appendTo(this.$row),i.default("<td />").text("-").appendTo(this.$row)}checkAllowedExtensions(){if(!this.dragUploader.filesExtensionsAllowed)return!0;const e=this.file.name.split(".").pop(),t=this.dragUploader.filesExtensionsAllowed.split(",");return-1!==i.default.inArray(e.toLowerCase(),t)}}class g{static fileSizeAsString(e){const t=e/1024;let i="";return i=t>1024?(t/1024).toFixed(1)+" MB":t.toFixed(1)+" KB",i}static addFileToIrre(e,t){const i={actionName:"typo3:foreignRelation:insert",objectGroup:e,table:"sys_file",uid:t.uid};a.MessageUtility.send(i)}static init(){const e=this.options;i.default.fn.extend({dragUploader:function(e){return this.each((t,s)=>{const a=i.default(s);let o=a.data("DragUploaderPlugin");o||a.data("DragUploaderPlugin",o=new h(s)),"string"==typeof e&&o[e]()})}}),i.default(()=>{i.default(".t3js-drag-uploader").dragUploader(e)})}}t.initialize=function(){g.init(),void 0!==TYPO3.settings&&void 0!==TYPO3.settings.RequireJS&&void 0!==TYPO3.settings.RequireJS.PostInitializationModules&&void 0!==TYPO3.settings.RequireJS.PostInitializationModules["TYPO3/CMS/Backend/DragUploader"]&&i.default.each(TYPO3.settings.RequireJS.PostInitializationModules["TYPO3/CMS/Backend/DragUploader"],(t,i)=>{e([i])})},t.initialize()}));
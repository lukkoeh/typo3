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
import RegularEvent from"@typo3/core/event/regular-event.js";import{html}from"lit";import{FileListActionEvent}from"@typo3/filelist/file-list-actions.js";import{default as Modal}from"@typo3/backend/modal.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import Notification from"@typo3/backend/notification.js";import Viewport from"@typo3/backend/viewport.js";class FileListRenameHandler{constructor(){new RegularEvent(FileListActionEvent.rename,(e=>{const t=e.detail,r=Modal.advanced({title:TYPO3.lang["file_rename.rename"]||"Rename",type:Modal.types.default,size:Modal.sizes.small,content:this.composeEditForm(t.resource),buttons:[{text:TYPO3.lang["file_rename.button.cancel"]||"Cancel",btnClass:"btn-default",name:"cancel",trigger:()=>{r.hideModal()}},{text:TYPO3.lang["file_rename.button.rename"]||"Rename",btnClass:"btn-primary",name:"rename",trigger:()=>{r.querySelector("form")?.requestSubmit()}}],callback:function(e){const r=e.querySelector("form");r.addEventListener("submit",(r=>{r.preventDefault();const o=new FormData(r.target),n=Object.fromEntries(o).name.toString();if(t.resource.name!==n){new AjaxRequest(TYPO3.settings.ajaxUrls.resource_rename).post({identifier:t.resource.identifier,resourceName:n}).then((async t=>{const r=await t.resolve();if(r.status.length>0&&r.status.forEach((e=>{r.success?Notification.success(e.title,e.message):Notification.error(e.title,e.message)})),"folder"===r.resource?.type){const e=Viewport.ContentContainer.getUrl();new URL(e,window.location.origin).searchParams.get("id")===r.origin.identifier?Viewport.ContentContainer.setUrl(e+"&id="+r.resource.identifier):Viewport.ContentContainer.refresh()}else Viewport.ContentContainer.refresh();top.document.dispatchEvent(new CustomEvent("typo3:filestoragetree:refresh")),e.hideModal()}))}})),e.addEventListener("typo3-modal-shown",(()=>{r.querySelector("input")?.focus()}))}})})).bindTo(document)}composeEditForm(e){return html`
      <form>
        <input name="name" class="form-control" value="${e.name}" required>
      </form>
    `}}export default new FileListRenameHandler;
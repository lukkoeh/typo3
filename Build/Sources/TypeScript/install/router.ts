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

import $ from 'jquery';
import {html} from 'lit';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import {AjaxResponse} from '@typo3/core/ajax/ajax-response';
import {AbstractInteractableModule} from './module/abstract-interactable-module';
import {AbstractInlineModule} from './module/abstract-inline-module';
import {default as Modal, ModalElement} from '@typo3/backend/modal';
import InfoBox from './renderable/info-box';
import ProgressBar from './renderable/progress-bar';
import Severity from './renderable/severity';
import {topLevelModuleImport} from '@typo3/backend/utility/top-level-module-import';
import '@typo3/backend/element/spinner-element';

class Router {
  private rootSelector: string = '.t3js-body';
  private contentSelector: string = '.t3js-module-body';

  private scaffoldSelector: string = '.t3js-scaffold';
  private scaffoldContentOverlaySelector: string = '.t3js-scaffold-content-overlay';
  private scaffoldMenuToggleSelector: string = '.t3js-topbar-button-modulemenu';

  private rootContainer: HTMLElement;
  private controller: string;
  private context: string;

  public setContent(content: string): void
  {
    let container = this.rootContainer.querySelector(this.contentSelector) as HTMLElement
    container.innerHTML = content;
  }

  public initialize(): void {
    this.rootContainer = document.querySelector(this.rootSelector);
    this.context = this.rootContainer.dataset.context ?? '';
    this.controller = this.rootContainer.dataset.controller ?? '';

    this.registerInstallToolRoutes();

    $(document).on('click', '.t3js-login-lockInstallTool', (e: JQueryEventObject): void => {
      e.preventDefault();
      this.logout();
    });
    $(document).on('click', '.t3js-login-login', (e: JQueryEventObject): void => {
      e.preventDefault();
      this.login();
    });
    $(document).on('keydown', '#t3-install-form-password', (e: JQueryEventObject): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        $('.t3js-login-login').trigger('click');
      }
    });

    $(document).on('click', '.card .btn', (e: JQueryEventObject): void => {
      e.preventDefault();

      const $me = $(e.currentTarget);
      const importModule = $me.data('import');
      const inlineState = $me.data('inline');
      const isInline = typeof inlineState !== 'undefined' && parseInt(inlineState, 10) === 1;
      if (isInline) {
        import(importModule).then(({default: aModule}: {default: AbstractInlineModule}): void => {
          aModule.initialize($me);
        });
      } else {
        const modalTitle = $me.closest('.card').find('.card-title').html();
        const modalSize = $me.data('modalSize') || Modal.sizes.large;
        const modal = Modal.advanced({
          type: Modal.types.default,
          title: modalTitle,
          size: modalSize,
          content: html`<div class="modal-loading"><typo3-backend-spinner size="default"></typo3-backend-spinner></div>`,
          additionalCssClasses: ['install-tool-modal'],
          staticBackdrop: true,
          callback: (currentModal: ModalElement): void => {
            import(importModule).then(({default: aModule}: {default: AbstractInteractableModule}): void => {
              const isInIframe = window.location !== window.parent.location;
              // @todo: Rework AbstractInteractableModule to avoid JQuery usage and pass ModalElement
              if (isInIframe) {
                topLevelModuleImport('jquery').then(({default: topLevelJQuery}: {default: JQueryStatic}): void => {
                  aModule.initialize(topLevelJQuery(currentModal));
                });
              } else {
                aModule.initialize($(currentModal));
              }
            });
          },
        });
      }
    });

    if (this.context === 'backend') {
      this.executeSilentConfigurationUpdate();
    } else {
      this.preAccessCheck();
    }
  }

  public registerInstallToolRoutes(): void {
    if (typeof TYPO3.settings === 'undefined') {
      TYPO3.settings = {
        ajaxUrls: {
          icons: window.location.origin + window.location.pathname + '?install[controller]=icon&install[action]=getIcon',
          icons_cache: window.location.origin + window.location.pathname + '?install[controller]=icon&install[action]=getCacheIdentifier',
        },
      };
    }
  }

  public getUrl(action?: string, controller?: string, query?: string): string {
    let url = location.href;
    url = url.replace(location.search, '');
    if (controller === undefined) {
      controller = this.controller;
    }
    url = url + '?install[controller]=' + controller;
    url = url + '&install[context]=' + this.context;
    if (action !== undefined) {
      url = url + '&install[action]=' + action;
    }
    if (query !== undefined) {
      url = url + '&' + query;
    }
    return url;
  }

  public executeSilentConfigurationUpdate(): void {
    this.updateLoadingInfo('Checking session and executing silent configuration update');
    (new AjaxRequest(this.getUrl('executeSilentConfigurationUpdate', 'layout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.executeSilentTemplateFileUpdate();
          } else {
            this.executeSilentConfigurationUpdate();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public executeSilentTemplateFileUpdate(): void {
    this.updateLoadingInfo('Checking session and executing silent template file update');
    (new AjaxRequest(this.getUrl('executeSilentTemplateFileUpdate', 'layout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.executeSilentExtensionConfigurationSynchronization();
          } else {
            this.executeSilentTemplateFileUpdate();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  /**
   * Extensions which come with new default settings in ext_conf_template.txt extension
   * configuration files get their new defaults written to system/settings.php
   */
  public executeSilentExtensionConfigurationSynchronization(): void {
    this.updateLoadingInfo('Executing silent extension configuration synchronization');
    (new AjaxRequest(this.getUrl('executeSilentExtensionConfigurationSynchronization', 'layout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.loadMainLayout();
          } else {
            this.setContent(InfoBox.render(Severity.error, 'Something went wrong', '').html());
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public loadMainLayout(): void {
    this.updateLoadingInfo('Loading main layout');
    (new AjaxRequest(this.getUrl('mainLayout', 'layout', 'install[module]=' + this.controller)))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
            this.rootContainer.innerHTML = data.html;
            // Mark main module as active in standalone
            if (this.context !== 'backend') {
              this.rootContainer.querySelector('[data-installroute-controller="' + this.controller + '"]').classList.add('modulemenu-action-active');
              this.registerScaffoldEvents();
            }
            this.loadCards();
          } else {
            this.rootContainer.innerHTML = InfoBox.render(Severity.error, 'Something went wrong', '').html();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public async handleAjaxError(error: AjaxResponse, $outputContainer?: JQuery): Promise<any> {
    let $message: any;
    if (error.response.status === 403) {
      // Install tool session expired - depending on context render error message or login
      if (this.context === 'backend') {
        this.rootContainer.innerHTML = InfoBox.render(Severity.error, 'The install tool session expired. Please reload the backend and try again.').html();
      } else {
        this.checkEnableInstallToolFile();
      }
    } else {
      // @todo Recovery tests should be started here
      const url = this.getUrl(undefined, 'upgrade');
      const message =
        '<div class="t3js-infobox callout callout-sm callout-danger">'
        + '<h4 class="callout-title">Something went wrong</h4>'
        + '<div class="callout-body">'
        + '<p>Please use <b><a href="' + url + '">Check for broken'
        + ' extensions</a></b> to see if a loaded extension breaks this part of the install tool'
        + ' and unload it.</p>'
        + '<p>The box below may additionally reveal further details on what went wrong depending on your debug settings.'
        + ' It may help to temporarily switch to debug mode using <b>Settings > Configuration Presets > Debug settings.</b></p>'
        + '<p>If this error happens at an early state and no full exception back trace is shown, it may also help'
        + ' to manually increase debugging output in <strong>%config-dir%/system/settings.php</strong>:'
        + '<code>[\'BE\'][\'debug\'] => true</code>, <code>[\'SYS\'][\'devIPmask\'] => \'*\'</code>, '
        + '<code>[\'SYS\'][\'displayErrors\'] => 1</code>,'
        + '<code>[\'SYS\'][\'exceptionalErrors\'] => 12290</code></p>'
        + '</div>'
        + '</div>'
        + '<div class="panel-group" role="tablist" aria-multiselectable="true">'
        + '<div class="panel panel-default searchhit">'
        + '<div class="panel-heading" role="tab" id="heading-error">'
        + '<h3 class="panel-title">'
        + '<a role="button" data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapse-error" aria-expanded="true" '
        + 'aria-controls="collapse-error" class="collapsed">'
        + '<span class="caret"></span>'
        + '<strong>Ajax error</strong>'
        + '</a>'
        + '</h3>'
        + '</div>'
        + '<div id="collapse-error" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-error">'
        + '<div class="panel-body">'
        + (await error.response.text())
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
      ;

      if (typeof $outputContainer !== 'undefined') {
        // Write to given output container. This is typically a modal if given
        $($outputContainer).empty().html(message);
      } else {
        // Else write to main frame
        this.rootContainer.innerHTML = message;
      }
    }
  }

  public checkEnableInstallToolFile(): void {
    (new AjaxRequest(this.getUrl('checkEnableInstallToolFile')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.checkLogin();
          } else {
            this.showEnableInstallTool();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public showEnableInstallTool(): void {
    (new AjaxRequest(this.getUrl('showEnableInstallToolFile')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.rootContainer.innerHTML = data.html;
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public checkLogin(): void {
    (new AjaxRequest(this.getUrl('checkLogin')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.loadMainLayout();
          } else {
            this.showLogin();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public showLogin(): void {
    (new AjaxRequest(this.getUrl('showLogin')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.rootContainer.innerHTML = data.html;
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public login(): void {
    const $outputContainer: JQuery = $('.t3js-login-output');
    const message: any = ProgressBar.render(Severity.loading, 'Loading...', '');
    $outputContainer.empty().html(message);
    (new AjaxRequest(this.getUrl()))
      .post({
        install: {
          action: 'login',
          token: $('[data-login-token]').data('login-token'),
          password: $('.t3-install-form-input-text').val(),
        },
      })
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.executeSilentConfigurationUpdate();
          } else {
            data.status.forEach((element: any): void => {
              const m: any = InfoBox.render(element.severity, element.title, element.message);
              $outputContainer.empty().html(m);
            });
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public logout(): void {
    (new AjaxRequest(this.getUrl('logout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.showEnableInstallTool();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public loadCards(): void {
    (new AjaxRequest(this.getUrl('cards')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
            this.setContent(data.html);
          } else {
            this.setContent(InfoBox.render(Severity.error, 'Something went wrong', '').html());
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public registerScaffoldEvents(): void {
    if(!localStorage.getItem('typo3-install-modulesCollapsed')) {
      localStorage.setItem('typo3-install-modulesCollapsed', 'false');
    }
    this.toggleMenu(localStorage.getItem('typo3-install-modulesCollapsed') === 'true' ? true : false);
    document.querySelector(this.scaffoldMenuToggleSelector).addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      this.toggleMenu();
    });
    document.querySelector(this.scaffoldContentOverlaySelector).addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      this.toggleMenu(true);
    });
    document.querySelectorAll('[data-installroute-controller]').forEach((element: Element) => {
      element.addEventListener('click', (event: MouseEvent) => {
        if (window.innerWidth < 768) {
          localStorage.setItem('typo3-install-modulesCollapsed', 'true');
        }
      });
    });
  }

  public toggleMenu(collapse?: boolean): void {
    const scaffold = document.querySelector(this.scaffoldSelector);
    const expandedClass = 'scaffold-modulemenu-expanded';
    if (typeof collapse === 'undefined') {
      collapse = scaffold.classList.contains(expandedClass);
    }
    scaffold.classList.toggle(expandedClass, !collapse);
    localStorage.setItem('typo3-install-modulesCollapsed', collapse ? 'true' : 'false');
  }

  public updateLoadingInfo(info: string): void {
    const infoElement = this.rootContainer.querySelector('#t3js-ui-block-detail');
    if (infoElement !== undefined && infoElement instanceof HTMLElement) {
      infoElement.innerText = info;
    }
  }

  private preAccessCheck(): void {
    this.updateLoadingInfo('Execute pre access check');
    (new AjaxRequest(this.getUrl('preAccessCheck', 'layout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.installToolLocked) {
            this.checkEnableInstallToolFile();
          } else if (!data.isAuthorized) {
            this.showLogin();
          } else {
            this.executeSilentConfigurationUpdate();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }
}

export default new Router();

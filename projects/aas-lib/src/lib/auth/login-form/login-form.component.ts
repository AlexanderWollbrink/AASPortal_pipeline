/******************************************************************************
 *
 * Copyright (c) 2019-2023 Fraunhofer IOSB-INA Lemgo,
 * eine rechtlich nicht selbstaendige Einrichtung der Fraunhofer-Gesellschaft
 * zur Foerderung der angewandten Forschung e.V.
 *
 *****************************************************************************/

import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Credentials, isValidEMail, isValidPassword, stringFormat } from 'common';
import { isEmpty } from 'lodash-es';

import { messageToString } from '../../convert';
import { ERRORS } from '../../types/errors';
import { INFO } from '../../types/info';
import { MessageEntry } from '../../types/message-entry';
import { AuthApiService } from '../auth-api.service';

export interface LoginFormResult {
    action?: string;
    stayLoggedIn?: boolean;
    token?: string;
}

@Component({
    selector: 'fhg-login',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
    private newPasswordSent = false;

    constructor(
        private modal: NgbActiveModal,
        private translate: TranslateService,
        private api: AuthApiService) { }

    public passwordPerEMail = false;

    public userId = '';

    public password = '';

    public stayLoggedIn = false;

    public messages: MessageEntry[] = [];

    public async resetPassword(): Promise<void> {
        this.clearMessages();
        if (!this.newPasswordSent) {
            if (isEmpty(this.userId)) {
                this.pushMessage(stringFormat(this.translate.instant(ERRORS.EMAIL_REQUIRED)));
            } else if (!isValidEMail(this.userId)) {
                this.pushMessage(stringFormat(this.translate.instant(ERRORS.INVALID_EMAIL)));
            } else {
                try {
                    this.pushMessage(stringFormat(this.translate.instant(INFO.NEW_PASSWORD_SENT), this.userId), 'bg-info w-100');
                } catch (error) {
                    this.pushMessage(messageToString(error, this.translate));
                } finally {
                    this.newPasswordSent = true;
                }
            }
        }
    }

    public registerUser(): void {
        this.modal.close({ action: "register" } as LoginFormResult);
    }

    public submit(): void {
        this.clearMessages();
        if (isEmpty(this.userId)) {
            this.pushMessage(stringFormat(this.translate.instant(ERRORS.EMAIL_REQUIRED)));
        } else if (!isValidEMail(this.userId)) {
            this.pushMessage(stringFormat(this.translate.instant(ERRORS.INVALID_EMAIL)));
        } else if (isEmpty(this.password)) {
            this.pushMessage(this.translate.instant(ERRORS.PASSWORD_REQUIRED));
        } else if (!isValidPassword(this.password)) {
            this.pushMessage(this.translate.instant(ERRORS.INVALID_PASSWORD));
        } else {
            const credentials: Credentials = { id: this.userId, password: this.password };
            this.api.login(credentials).subscribe(
                {
                    next: value => {
                        const result: LoginFormResult = {
                            stayLoggedIn: this.stayLoggedIn,
                            token: value.token
                        };

                        this.modal.close(result);
                    },
                    error: error => this.pushMessage(messageToString(error, this.translate))
                });
        }
    }

    public cancel(): void {
        this.modal.close();
    }

    private pushMessage(text: string, type = 'bg-danger w-100'): void {
        this.messages = [{
            text: text,
            classname: type,
            autohide: false,
            delay: 0
        }];
    }

    private clearMessages(): void {
        this.messages = [];
    }
}
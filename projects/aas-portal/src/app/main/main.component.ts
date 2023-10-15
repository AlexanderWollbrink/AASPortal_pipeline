/******************************************************************************
 *
 * Copyright (c) 2019-2023 Fraunhofer IOSB-INA Lemgo,
 * eine rechtlich nicht selbstaendige Einrichtung der Fraunhofer-Gesellschaft
 * zur Foerderung der angewandten Forschung e.V.
 *
 *****************************************************************************/

import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, first, map } from 'rxjs';
import { ClipboardService, WindowService, AASQuery } from 'projects/aas-lib/src/public-api';
import { ProjectService } from '../project/project.service';
import { ToolbarService } from '../toolbar.service';

export enum LinkId {
    START = 0,
    AAS = 1,
    VIEW = 2,
    DASHBOARD = 3,
    ABOUT = 4
}

export interface LinkDescriptor {
    id: LinkId;
    name: string;
    url: string;
}

@Component({
    selector: 'fhg-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
    private readonly subscription = new Subscription();
    private readonly _links: LinkDescriptor[] = [
        {
            id: LinkId.START, name: "CAPTION_START", url: "/start"
        },
        {
            id: LinkId.AAS, name: "CAPTION_AAS", url: '/aas'
        },
        {
            id: LinkId.VIEW, name: "CAPTION_VIEW", url: '/view'
        },
        {
            id: LinkId.DASHBOARD, name: "CAPTION_DASHBOARD", url: '/dashboard'
        },
        {
            id: LinkId.ABOUT, name: "CAPTION_ABOUT", url: "/about"
        }
    ];

    constructor(
        private readonly router: Router,
        private readonly window: WindowService,
        private readonly project: ProjectService,
        private readonly clipboard: ClipboardService,
        private readonly viewContainer: ViewContainerRef,
        private readonly toolbar: ToolbarService) {

        this.toolbarTemplate = this.toolbar.toolbarTemplate.pipe(map(value => this.nextToolbar(value)))
    }

    @ViewChild('emptyToolbar', { read: TemplateRef })
    public emptyToolbar!: TemplateRef<unknown>;

    public toolbarTemplate: Observable<TemplateRef<unknown> | null>;

    public activeId = LinkId.START;

    public get links(): LinkDescriptor[] {
        return this._links;
    }

    public ngOnInit(): void {
        const params = this.window.getQueryParams();
        const id = params.get('id');
        if (id) {
            this.project.findDocument(id).pipe(first()).subscribe(document => {
                if (document) {
                    this.clipboard.set('AASQuery', { id: document.id } as AASQuery);
                    this.router.navigateByUrl('/aas?format=AASQuery');
                } else {
                    this.router.navigateByUrl('/start');
                }
            });
        } else {
            this.router.navigateByUrl('/start');
        }
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private nextToolbar(value: TemplateRef<unknown> | null): TemplateRef<unknown> {
        return value ?? this.emptyToolbar;
    }
}
/******************************************************************************
 *
 * Copyright (c) 2019-2023 Fraunhofer IOSB-INA Lemgo,
 * eine rechtlich nicht selbstaendige Einrichtung der Fraunhofer-Gesellschaft
 * zur Foerderung der angewandten Forschung e.V.
 *
 *****************************************************************************/

import { AASDocument } from 'common';
import { Logger } from '../logging/logger.js';
import { AasxPackage } from '../packages/aasx-directory/aasx-package.js';
import { AasxDirectory } from '../packages/aasx-directory/aasx-directory.js';
import { extname } from 'path';
import { AASResourceScan } from './aas-resource-scan.js';

export class DirectoryScan extends AASResourceScan {
    constructor(
        private readonly logger: Logger,
        private readonly source: AasxDirectory
    ) {
        super();
    }

    public async scanAsync(): Promise<AASDocument[]> {
        try {
            await this.source.openAsync()
            const files = await this.source.getStorage().readDir('.');
            const documents: AASDocument[] = [];

            for (const file of files) {
                try {
                    const extension = extname(file);
                    if (extension === '.aasx') {
                        const aasxPackage = new AasxPackage(this.logger, this.source, file);
                        const document = await aasxPackage.createDocumentAsync();
                        documents.push(document);
                        this.emit('scanned', document);
                    }
                } catch (error) {
                    this.emit('error', error, this.source, file);
                }
            }

            return documents;
        } finally {
            await this.source.closeAsync();
        }
    }
}
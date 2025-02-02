/******************************************************************************
 *
 * Copyright (c) 2019-2023 Fraunhofer IOSB-INA Lemgo,
 * eine rechtlich nicht selbstaendige Einrichtung der Fraunhofer-Gesellschaft
 * zur Foerderung der angewandten Forschung e.V.
 *
 *****************************************************************************/

import { DependencyContainer } from 'tsyringe';
import { UserStorage } from './user-storage.js';
import { LocaleUserStorage } from './locale-user-storage.js';
import { Variable } from '../variable.js';
import { MongoDBUserStorage } from './mongo-db-user-storage.js';
import { Logger } from '../logging/logger.js';

/* istanbul ignore next */
export class UserStorageFactory {
    constructor(private readonly container: DependencyContainer) {
    }

    public create(): UserStorage {
        const url = this.container.resolve(Variable).USER_STORAGE;
        const logger = this.container.resolve<Logger>('Logger');
        if (url) {
            try {
                if (new URL(url).protocol === 'mongodb:') {
                    const storage = this.container.resolve(MongoDBUserStorage);
                    logger.info(`Using user storage at: ${url}`);
                    return storage;
                } else {
                    throw new Error(`"${url}" is a not supported user storage.`);
                }
            } catch (error) {
                logger.error(error);
            }
        }

        const storage = this.container.resolve(LocaleUserStorage);
        logger.info(`Using local user storage.`);
        return storage;
    }
}
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

export interface ResolveEntryConfig {
    field: string;
    resolveTo: string;
}

export interface TypeConfig {
    /**
     * Contentful content type ID
     */
    id: string;
    /**
     * Directory where entries will be placed
     */
    directory: string;
    type?: string;
    title?: string;
    dateField?: string;
    /**
     * The field that will act as the main content of the .md file
     */
    mainContent?: string;
    fileExtension?: string;
    /**
     * Configs specifying how to resolve asset references and entry references
     */
    resolveEntries?: ResolveEntryConfig[];
}

export interface SingleTypeConfig extends TypeConfig {
    fileName: string;
}

export interface RepeatableTypeConfig extends TypeConfig {
    isHeadless?: boolean;
    isTaxonomy?: boolean;
}

export interface ContentfulConfig {
    singleTypes: SingleTypeConfig[];
    repeatableTypes: RepeatableTypeConfig[];
}

/**
 * Determine if a file is yaml or js depending on the file extension
 */
const determineFileType = (fileName: string): string | null => {
    const splitStr = fileName.split('.');
    const fileExtension = splitStr[splitStr.length - 1];
    switch (fileExtension) {
        case 'js':
            return 'javascript';
        case 'yaml':
        case 'yml':
            return 'yaml';
        default:
            return null;
    }
};

const isContentfulConfig = (input: unknown): input is ContentfulConfig => {
    return (input as ContentfulConfig) !== undefined;
};

/**
 * Attempt to load a config file
 */
const loadFile = async (
    rootDir = '.',
    fileName: string
): Promise<ContentfulConfig | false> => {
    return new Promise(resolve => {
        const filePath = path.resolve(rootDir, fileName);
        if (fs.existsSync(filePath)) {
            const fileType = determineFileType(fileName);
            if (fileType === 'javascript') {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const configObject = require(filePath);
                return resolve(configObject);
            }
            if (fileType === 'yaml') {
                const configObject = yaml.safeLoad(
                    fs.readFileSync(filePath).toString()
                );
                if (isContentfulConfig(configObject)) {
                    return resolve(configObject);
                }
                return resolve(false);
            }
        }
        return resolve(false);
    });
};

const loadConfig = async (
    rootDir = '.',
    fileName: string | null = null
): Promise<ContentfulConfig | false> => {
    rootDir = path.resolve(rootDir);
    if (fileName) {
        const result = await loadFile(rootDir, fileName);
        if (result) {
            return result;
        }
        throw new Error(`${fileName} does not exist or it is empty.`);
    }
    const defaultConfigs = [
        'contentful-hugo.config.js',
        'contentful-hugo.config.yaml',
        'contentful-hugo.yaml',
        'contentful-settings.yaml',
    ];
    const tasks = [];
    const configList: ContentfulConfig[] = [];
    for (const config of defaultConfigs) {
        const file = loadFile(rootDir, config).then(result => {
            if (result) {
                configList.push(result);
            }
        });
        tasks.push(file);
    }
    return Promise.all(tasks).then(() => {
        for (const config of configList) {
            return config;
        }
        return false;
    });
};

export { loadConfig, determineFileType };
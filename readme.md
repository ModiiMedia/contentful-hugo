# Contentful Hugo

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/281eacf31e864217953437f66b7e3a72)](https://www.codacy.com/app/joshmossas/contentful-hugo?utm_source=github.com&utm_medium=referral&utm_content=ModiiMedia/contentful-hugo&utm_campaign=Badge_Grade)

This is a simple Node.js CLI tool that pulls data from Contentful CMS and turns it into Markdown or YAML files for use with a static site generator. It can be used with any static site generator that uses Markdown with YAML frontmatter, but it has some features that are specific to [Hugo](https://gohugo.io).

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Usage](#usage)
    -   [CLI Usage](#terminal-commands)
    -   [Javascript Usage](#javascript-usage)
-   [Configuration](#configuration)
    -   [Environenment Variables](#environment-variables)
    -   [Config File(s)](#config-file)
-   [Expected Output](#expected-output)
    -   [Standard Fields](#default-date-and-time-fields)
    -   [Richtext Fields](#rich-text-as-main-content)
    -   [Resolving Reference Fields](#the-resolve-entries-parameter)
-   [Known Issues](#known-issues)

## Prerequisites

Install [Node.js](https://nodejs.org)

## Installation

**Local install**

```powershell
npm install contentful-hugo

# then run
npx contentful-hugo --init
```

**Global install**

```powershell
npm install -g contentful-hugo

# then run in the root of the new project directory
contentful-hugo --init
```

## Usage

### Terminal Commands

Complete [configuration](#configuration) then run the following command(s) in the terminal

#### When Installed Globally

```powershell
contentful-hugo
```

#### When Installed Locally

```powershell
npx contentful-hugo
```

#### Flags

| flag      | aliases | description                                                                                              |
| --------- | ------- | -------------------------------------------------------------------------------------------------------- |
| --init    |         | Initialize the directory. Generates a config file and default shortcodes for Contentful rich text fields |
| --preview | -P      | Runs in preview mode, which pulls both published and unpublished entries from Contentful                 |
| --wait    | -W      | Wait for the specified number of milliseconds before pulling data from Contentful.                       |
| --config  | -C      | Specify the path to a config file.                                                                       |
| --help    |         | Show help                                                                                                |
| --version |         | Show version number                                                                                      |

##### Preview Mode Example

```powershell
contentful-hugo --preview
```

##### Multiple Flags Example

```powershell
contentful-hugo --wait=2000 --preview --config="my_custom_config.js"

# or

contentful-hugo --wait 2000 --preview --config my_custom_config.js
```

#### Example Package.json

```JSON
{
  "name": "my-hugo-project",
  "scripts": {
    "prestart": "contentful-hugo",
    "start": "hugo server",
    "prebuild": "contentful-hugo",
    "build": "hugo --minify"
  }
}
```

In this example when you run `npm start` it will first use contentful-hugo to pull Contentful data then start hugo server. In the same way when you do the command `npm run build` it will first use contentful-hugo to pull Contentful data then run `hugo --minify` to build a minified version of your hugo site.

### Javascript Usage

You can also import this libraries core methods and use it in part of a nodejs environment

#### Simple Example

```js
const { loadConfig, fetchDataFromContentful } = require('contentful-hugo');

// standard mode
loadConfig().then(config => {
    // will generate files according to config
    fetchDataFromContentful(config);
});

// preview mode
loadConfig().then(config => {
    fetchDataFromContentful(config, true);
});
```

#### Custom Config Object

```js
const { fetchDataFromContentful } = require('contentful-hugo');

const myConfig = {
    contentful: {
        space: 'my-space-id',
        token: 'my-token',
        previewToken: 'my-preview-token',
        environment: 'my-env-id',
    },
    singleTypes: [
        // single types go here
    ],
    repeatableTypes: [
        // repeatable types go here
    ],
};

fetchDataFromContentful(myConfig);
```

#### Import / Export

ES6 style imports are also supported

```js
import { fetchDataFromContentful } from 'contentful-hugo';
```

### Error Messages

Trying to use this package before completing configuration will return an error in the console

```shell
Error: There is an error in your config file, or it does't exits.
Check your config for errors or run "contentful-hugo --init" to create a config file.
```

## Configuration

### Environment Variables

By default this library will look for the following environment variables. You can also override these values with the config file. (See [config](#config-file))

-   CONTENTFUL_SPACE
-   CONTENTFUL_TOKEN
-   CONTENTFUL_PREVIEW_TOKEN

**.env File:**

To declare these environment variables create a `.env` file in the root directory of your project.

```TOML
CONTENTFUL_SPACE = '<space-id>'
CONTENTFUL_TOKEN = '<content-accessToken>'

# optional but required for preview mode
CONTENTFUL_PREVIEW_TOKEN = '<preview-accessToken>'
```

You can also declare the environment variables in the command line

**Powershell:**

```powershell
$env:CONTENTFUL_SPACE="<contentful_space_id>"
$env:CONTENTFUL_TOKEN="<contentful_acessToken>"
$env:CONTENTFUL_PREVIEW_TOKEN="<contentful_preview_accessToken>"
```

**Bash:**

```bash
export CONTENTFUL_SPACE="<contentful_space_id>"
export CONTENTFUL_TOKEN="<contentful_accessToken>"
export CONTENTFUL_PREVIEW_TOKEN="<contentful_preview_accessToken>"
```

### Config File

Before getting started, you will need to create a config file in the root of your repository. Contentful-hugo by default will search for the following files as a config.

-   `contentful-hugo.config.js`
-   `contentful-hugo.config.yaml`
-   `contentful-hugo.yaml`
-   `contentful-settings.yaml`

You can also specify a custom config file using the `--config` flag. (Javascript or YAML config files are the only currently accepted filetypes)

#### Example Javascript Config

```javascript
// contentful-hugo.config.js

module.exports = {
    contentful: {
        // defaults to CONTENTFUL_SPACE env variable
        space: 'space-id',
        // defaults to CONTENTFUL_TOKEN env variable
        token: 'content-deliver-token',
        // defaults to CONTENTFUL_PREVIEW_TOKEN env variable
        previewToken: 'content-preview-token',
        // defaults to "master"
        environment: 'master',
    },
    singleTypes: [
        {
            id: 'homepage',
            directory: 'content',
            fileName: '_index',
            fileExtension: 'md',
        },
        {
            id: 'siteSettings',
            directory: 'data',
            fileName: 'settings',
            fileExtension: 'yaml',
        },
    ],
    repeatableTypes: [
        {
            id: 'posts',
            directory: 'content/posts',
            fileExtension: 'md',
            mainContent: 'content',
            resolveEntries: [
                {
                    field: 'categories',
                    resolveTo: 'fields.slug',
                },
                {
                    field: 'author',
                    resolveTo: 'fields.name',
                },
                {
                    field: 'relatedPosts',
                    resolveTo: 'sys.id',
                },
            ],
        },
        {
            id: 'seoFields',
            isHeadless: true,
            directory: 'content/seo-fields',
        },
        {
            id: 'reviews',
            directory: 'content/reviews',
            mainContent: 'reviewBody',
        },
        {
            id: 'category',
            directory: 'content/categories',
            isTaxonomy: true, // Experimental Feature
        },
    ],
};
```

#### Example YAML Config

```yaml
# contentful-hugo.config.yaml

contentful:
    space: 'space-id' # defaults to CONTENTFUL_SPACE env variable
    token: 'content-deliver-token' # defaults to  CONTENTFUL_TOKEN env variable
    previewToken: 'content-preview-token' # defaults to  CONTENTFUL_PREVIEW_TOKEN env variable
    environment: 'master' # defaults to "master"

singleTypes:
    # fetches only the most recently updated entry in a particular content type
    # Generated file will be named after the fileName setting

    - id: homepage
      directory: content
      fileName: _index
      fileExtension: md

    - id: siteSettings
      directory: data
      fileName: settings
      fileExtension: yaml

repeatableTypes:
    # fetches all the entries of a content type and places them in a directory.
    # Generated files will be named after their Entry ID in Contentful.

    - id: posts
      directory: content/posts
      fileExtension: md
      mainContent: content
      resolveEntries: # resolves a reference or asset field to a specific property
          - field: categories
            resolveTo: fields.slug
          - field: author
            resolveTo: fields.name
          - field: relatedPosts
            resolveTo: sys.id

    - id: seoFields
      isHeadless: true
      directory: content/seo-fields

    - id: reviews
      directory: content/reviews
      mainContent: reviewBody

    - id: staff
      isHeadless: true
      directory: content/staff

    - id: category
      directory: content/categories
      isTaxonomy: true # Experimental Feature
```

#### **Config Fields**

##### <u>**Contentful Options**</u>

| field        | required | description                                                                                  |
| ------------ | -------- | -------------------------------------------------------------------------------------------- |
| space        | optional | Contentful Space ID (Defaults to CONTENTFUL_SPACE environment variable if not set)           |
| token        | optional | Content delivery token (Defaults to CONTENTFUL_TOKEN environment variable if not set)        |
| previewToken | optional | Content preview token (Defaults to CONTENTFUL_PREVIEW_TOKEN environment variable if not set) |
| environment  | optional | Contentful environment ID (Defaults to "master" if not set)                                  |

##### <u>**Single Type Options**</u>

| field          | required | description                                                                                                                   |
| -------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| id             | required | Contentful content type ID                                                                                                    |
| directory      | required | Directory where you want the file(s) to be generated                                                                          |
| fileName       | required | Name of the file generated                                                                                                    |
| fileExtension  | optional | Can be "md", "yml", or "yaml" (defaults to "md")                                                                              |
| mainContent    | optional | Field ID for field you want to be the main Markdown content. (Can be a markdown, richtext, or string field)                   |
| type           | optional | Manually set value for "type" field in the frontmatter (see [hugo docs](https://gohugo.io/content-management/types/))         |
| resolveEntries | optional | Resolve the specified reference fields and/or asset fields to one of it's properties specified with the `resolveTo` parameter |

##### <u>**Repeatable Type Options**</u>

| field                     | required | description                                                                                                                                                                                                                                |
| ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                        | required | Contentful content type ID                                                                                                                                                                                                                 |
| directory                 | required | Directory where you want the files to be generated                                                                                                                                                                                         |
| fileExtension             | optional | Can be "md", "yml", or "yaml" (defaults to "md")                                                                                                                                                                                           |
| isHeadless                | optional | Turns all entries in a content type into headless leaf bundles (see [hugo docs](https://gohugo.io/content-management/page-bundles/#headless-bundle)). Cannot be set to true when isTaxonomy is set to true.                                |
| isTaxonomy (Experimental) | optional | Organize entries in file structure allowing for custom taxonomy metadata (see [hugo docs](https://gohugo.io/content-management/taxonomies/#add-custom-metadata-a-taxonomy-or-term)). Cannot be set to true when isHeadless is set to true. |
| mainContent               | optional | Field ID for field you want to be the main markdown content. (Can be a markdown, richtext, or string field)                                                                                                                                |
| type                      | optional | Manually set value for "type" field in the frontmatter (see [hugo docs](https://gohugo.io/content-management/types/))                                                                                                                      |
| resolveEntries            | optional | Resolve the specified reference fields and/or asset fields to one of it's properties specified with the `resolveTo` parameter                                                                                                              |

#### Advanced Config Example

Here is an example of dynamically change the `token`, `previewToken`, and `environment` options depending on any arbitrary condition.

```javascript
// contentful-hugo.config.js

require('dotenv').config(); // assuming you have "dotenv" in your dependencies

const myMasterToken = process.env.CONTENTFUL_MASTER_TOKEN;
const myMasterPreviewToken = process.env.CONTENTFUL_MASTER_PREVIEW_TOKEN;
const myStagingToken = process.env.CONTENTFUL_STAGING_TOKEN;
const myStagingPreviewToken = process.env.CONTENTFUL_STAGING_PREVIEW_TOKEN;

// set some condition
const isStaging = true || false;

module.exports = {
    contentful: {
        space: 'my-space-id',
        token: isStaging ? myStagingToken : myMasterToken,
        preview: isStaging ? myStagingPreviewToken : myMasterPreviewToken,
        environment: isStaging ? 'staging' : 'master',
    },
    // rest of config
};
```

## Expected Output

Files will be generated in the directory specified in the config file. Front matter will be in YAML format. Files of single types will be named after fileName specified in the config file. Files of repeatable types will be named after their entry ID in Contenful, which makes it easy to link files together.

### Default Date and Time Fields

The following fields will always appear in your frontmatter:

```yaml
updated: # the last time this entry was update in Contentful
createdAt: # when the entry was created in Contentful
date: # defaults to creation date unless you have a field with the id "date" then it get's overwritten
```

### Asset Information

Assets like images and videos come with some extra information that makes it easy to implement things like alt text or layouts that rely on knowing the image dimensions. The fields are as follows:

```yaml
assetFieldName:
    assetType: # indicates the asset type such as "image" "video" "audio" ect.
    url: # url of the asset
    title: # title of the asset written in Contentful
    description: # description of the asset written in Contentful
    width: # width of the asset (images only)
    height: # height of the asset (images only )
```

If you're using Hugo you can access the information like below:

```html
<img
    src="{{ .Params.assetFieldName.url }}"
    width="{{ .Params.assetFieldName.width }}"
/>
```

This same information will also appear in asset arrays like a gallery:

```yaml
myGallery:
    - assetType: 'image/jpg'
      url: '//link-to-image.jpg'
      title: 'Image 1'
      description: 'Image 1 Description'
      width: 500
      height: 500
    - assetType: 'image/jpg'
      url: '//link-to-image-2.jpg'
      title: 'Image 2'
      description: 'Image 2 Description'
      width: 1920
      height: 1080
```

### Entries

Linked entries will include fields for it's id and it's content type id.

```yaml
linkedEntry:
    id: <contentful-entry-id>
    typeId: <content-type-ID>

#example with array of linked entries

relatedArticles:
    - id: '41UFfIhszbS1kh95bomMj7'
      typeId: 'articles'
    - id: '85UFfIhsacS1kh71bpqMj7'
      typeId: 'articles'
```

All files are named after their entry id in Contentful making it easy to retrieve it using .Site.GetPage in Hugo

```go
{{ with .Site.GetPage "<path-to-file>/<entry-id>.md" }}
    {{ .Title }}
{{ end }}
```

### Rich Text As Main Content

A rich text field that is set as the "mainContent" for a content type will be rendered as markdown for Hugo.

Dynamic content such as `embedded-entry-blocks` are rendered as shortcodes with parameters included that can be used to fetch the necessary data.

```md
<!-- example embedded entry -->
<!-- you can use the id, contentType, and parentContentType parameters to fetch the desired data -->

{{< contentful-hugo/embedded-entry id="nTLo2ffSJJp5QrnrO5IU9" contentType="gallery" parentContentType="post" >}}
```

Before fetching rich text data make sure you have run `contentful-hugo --init` so that you will have all the rich text shortcodes. Once you have these shortcodes you can extend and modify them to suit your needs.

The list of rich text short codes includes:

-   contentful-hugo/asset-hyperlink.html
-   contentful-hugo/embedded-asset.html
-   contentful-hugo/embedded-entry.html
-   contentful-hugo/entry-hyperlink.html
-   contentful-hugo/inline-entry.html

By default the richtext short codes will show a notification for an unconfigured item.

![Unconfigured Embedded Entry Block](https://raw.githubusercontent.com/ModiiMedia/contentful-hugo/master/images/unconfigured-embedded-entry.PNG?raw=true)

You can customize them by navigating to `layouts/shortcodes/contentful-hugo/{shortcode-name}.html`

### Rich Text In FrontMatter

A Rich text field will produce nested arrays mirroring the JSON structure that they have in the API. Each node will need to be looped through and produce HTML depending on the nodeType field.

```yaml
richTextField:
    - nodeType: 'paragraph'
      data: {}
      content:
          - data: {}
            marks: []
            value: 'This is a simple paragraph.'
            nodeType: 'text'
    - nodeType: 'paragraph'
      data: {}
      content:
          - data: {}
            marks: []
            value: 'This is a paragraph with '
            nodeType: 'text'
          - data: {}
            marks:
                - type: 'italic'
            value: 'italicized text.'
            nodeType: 'text'
    - nodeType: 'embedded-asset-block'
      data:
          assetType: 'image/jpeg'
          url: '//images.ctfassets.net/some-image-url.jpg'
          title: 'Image title will appear here'
          description: 'Image description will appear here'
          width: 1920
          height: 1080
      content: []
```

In addition a plaintext version of the field will be generated using the field ID appended with "\_plaintext". This allows you to quickly fetch the text by itself without any of the other data. A simple use case would be using the plaintext output to automatically generate a meta description for a webpage.

```yaml
richTextField_plaintext: 'This is a simple paragraph. This is a paragraph with italicized text.'
```

### The Resolve Entries Parameter

The resolve entries option let's you specify a field from a referenced entry or asset to resolve that field value you. For example say you have a `category` content type that is referenced in `posts`. Normally contentful-hugo will give the following result

```yaml
category:
    id: some-entry-id
    contentType: category
```

While this makes it easy to find the category, this format does not allow you to use Hugo's built in taxonomy features. With the `resolveEntries` parameter you can remedy this.

```js
// from the config file
module.exports = {
    repeatableTypes: [
        {
            id: 'post',
            directory: 'content/posts',
            resolveEntries: [
                {
                    field: 'category',
                    resolveTo: 'fields.slug',
                },
            ],
        },
    ],
};
```

Now the category field will only display the slug as the value.

```yaml
category: my-category-slug
```

The resolve entries feature works with both reference fields and asset fields. (As well as multiple reference and multiple asset fields)

## Known Issues

These are some known issues.

-   **Date & Time Field w/o Timezone**: Date fields that include time but do not have a specified timezone will have a timezone set based on whatever machine the script is run on. So using a date field in contentful with this setting could lead to unexpected results when formatting dates. Date fields that don't include time (ex: YYYY-MM-DD) are not effected by this.
-   **Fetching Data Before Contentful CDN Updates**: Sometimes when triggering a build from a webhook, it won't always get the latest data. This is because it sometimes takes a couple seconds for the latest data to get distrubuted across Contentful's CDN. If you run into this issue add teh the `--wait` flag to your script. Here's an example where we wait an additional 6 seconds `contentful-hugo --wait=6000`.

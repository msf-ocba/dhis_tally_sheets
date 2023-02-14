# Tally Sheets

## Setup and Installation
Build the app running:

```console
shell:~$ yarn install # first time only
shell:~$ yarn build
```
This will create a `hmis-tally-sheets.zip` file that can be manually installed in DHIS2 App Management.

## Development

The above mentioned method of deploying the app is not suited for development. To deploy a local instance of the app use:
```console
shell:~$ yarn start
```

This deploys a [http-server](https://github.com/http-party/http-server) serving the app with a proxy to the DHIS2 instance to serve the DHIS2 API calls.
The `yarn start` command reads the variables present in `.env.local` to start the local server. Use `.env` as a template to create it.

## Development environment building

The app dependencies in `assets/includes` has been migrated to `yarn` using `yarn info <package>@<ver> repository` to compare the repositories mentioned in the old files and the ones from Yarn to ensure we get the correct ones. Some files needed to be cross-checked to ensure thy were the same.

The `build-deps.sh` script is used as a postinstall script to make a copy of the necessary files to the `assets/includes` folder to avoid uploading unnecessary files with the app build zip file.

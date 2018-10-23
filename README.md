# Release notes generator

## Installation instructions
 
We have these installation instructions in place while we figure how we want to publish this NPM module in the central repository.

Requirements:
- [NodeJS](https://nodejs.org) 8.12.0 LTS
- [NPM](https://nodejs.org) 6.4.1 

Instructions:
1. Clone this repo
2. `cd` to the root of the repo
3. Run `npm install` to get all the project's dependencies
3. Run `npm install -g` (you might have to `sudo` it)

## Usage instructions

Run this tool with `release-notes-generator <path> <version1> <version2>`. Arguments:
- `<path>`: Path to the GIT repo you want to generate a release notes for
- `<version1>`, and `<version2>`: Versions that define the range of commits your release notes will include

Example: `release-notes-generator /home/guillermo/src/odk/briefcase v1.11.0 v1.12.0`

  (This will generate a release notes for Briefcase between versions v1.11.0 and v1.12.0)  
# js-swagger-generator (jog)
[![DeepScan grade](https://deepscan.io/api/teams/5441/projects/7228/branches/69523/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5441&pid=7228&bid=69523)
[![Known Vulnerabilities](https://snyk.io//test/github/maxvanceffer/js-swagger-generator/badge.svg?targetFile=package.json)](https://snyk.io//test/github/maxvanceffer/js-swagger-generator?targetFile=package.json)

Generates js functions ready to use, from swagger file (3.0 and higher)

## Installing

Using npm:
```bash
$ npm install js-swagger-generator --save-dev
```
*Saving as dev dependency, because generator usually needed for development* 

## Generator API

Engine used to generate source from open api/swagger specification. 
 
Options:

    --language: es [js, es, ts, c++]
    --client: [fetch, axios, superagent] Only required for javascript and typescript


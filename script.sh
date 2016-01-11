#!/bin/sh
npm install $(PWD)
cd client/default/
npm install bower -g
bower install

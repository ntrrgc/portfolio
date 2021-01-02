#!/bin/bash
chmod o+r web/img/*
node build.js && exec rsync -Pr web/ ntrrgc@ntrrgc.me:/srv/www/ntrrgc.me/
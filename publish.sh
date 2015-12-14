#!/bin/bash
chmod o+r web/img/*
node build.js && exec rsync -Pr web/ ntrrgc@rufian.eu:/srv/www/ntrrgc.rufian.eu/portfolio/
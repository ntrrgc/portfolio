#!/bin/bash
chmod o+r web/img/*
node build.js && exec rsync -Pr web/ root@nas.lan:/HomeNAS/Portfolio/
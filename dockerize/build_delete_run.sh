#!/bin/bash

sh ./dockerize/build.sh &&
sh ./dockerize/delete.sh
sh ./dockerize/run.sh
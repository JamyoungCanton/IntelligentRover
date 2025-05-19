#!/bin/bash
git fetch --all && \
git checkout master && \
git merge origin/master && \
git merge travel-uniapp/master && \
git push origin master && \
git push travel-uniapp master && \
git checkout travel && \
git merge origin/travel && \
git merge travel-uniapp/travel && \
git push origin travel && \
git push travel-uniapp travel
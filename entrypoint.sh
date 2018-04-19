#! /bin/bash

if [ -d "/gpg" ]; then
  gpg --import /gpg/public.key
  gpg --import /gpg/private.key
fi

npm run start-server -- "$@"

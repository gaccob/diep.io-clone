#!/bin/sh

# proto generate
./node_modules/protobufjs/bin/pbjs  ./proto/tank.proto -t json > ./www/tank.proto.json

# cfg generate
python ./cfg/conv2js.py --excel_file=./cfg/config.xlsx --output_path=./cfg/ --skip_rows=1

# client html template convert
./node_modules/.bin/browserify modules/client.js  -o ./www/index.js

# start
node modules/server.js


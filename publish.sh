#!/bin/sh

# proto generate
./node_modules/protobufjs/bin/pbjs  ./proto/tank.proto -t json > ./proto/tank.proto.json
cp ./proto/tank.proto.json ./www/tank.proto.json

# cfg generate
python ./cfg/conv2js.py --excel_file=./cfg/config.xlsx --output_path=./cfg/ --skip_rows=1

# client html template convert
cd ./www/ && lua compile_module.lua


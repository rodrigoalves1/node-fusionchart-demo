# node-fusionchart-demo

To see the demo chart install mongodb (https://goo.gl/iMcdvT) on your machine. After instalation, make sure you have the daemon mongd running.

After that populate a database with the data in the data.json file: `mongoimport -d fusion_demo -c fuel_price --type json --file data.json --jsonArray`

Then run npm install and npm server.js

A demo will be shown at localhost:3300

For more in depth info, please visit the tutorial site: https://goo.gl/OK7LC7

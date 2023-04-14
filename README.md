# Backdrop-api-test
### A node-graphql api for resolving bank details and verifying users


#
### Run the web service Locally

### Open new terminal window and clone this repository
```
git clone https://github.com/jutivia/Backdrop-api-test/
```
#### Install dependencies
```
npm install

```
#### Test api
```
npm test

```
#### Drop database
```
node db/import-dev-data.js --delete

```
#### Add users to database
```
node db/import-dev-data.js --import
```

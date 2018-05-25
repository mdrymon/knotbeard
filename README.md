# knotbeard

Application

 that searches for and manages your TV shows based on Node.Js Strongloop

## Installation
Require node v9+.

```bash
$ npm install
```

## Configure handler
Edit *server/handler/config.json*

## Run

```bash
$ npm start
```

## Provider
- Torrent:
   - cpasbien
- Database:
   - thetvdb
- Downloader:
   - All directory .torrent files scanner 
   - Synology: DownloadStation (under construction)

## Development
Api definition:
http://localhost:3000/explorer

### Workflow (/api/\* & /:id/\*):

 - Serie:
   - Search: "Vikings"
   - Get the remote serie Id
   - Load serie & episodes
 - Episode:
   - Serach a .torrent 
   - Parse the torrent file to get his data
   - Download the .torrent
   - Scan download files
   - Move them into a structured serie directory.

## Templating : Ajax/Socket
client/[template]


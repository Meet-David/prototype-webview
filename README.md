# MeetDavid - Finding friends in your neighborhood Prototype  

## How to run dev mode
1. start server
```
cd server
npm install
npm run dev
```

2. start frontend
```
cd frontend
npm install
npm run dev
```

3. test in the browser
```
http://localhost:5173/
```

## How to run prod mode
1. start ngrok
```
cd server
npm run ngrok
```

2. start server
```
cd server
npm run start
# enter your ngrok websocket url
```

## API Commands

### Form a group
```
curl -X POST https://e211-24-246-79-84.ngrok-free.app/api/groups/form-group \
  -H "Content-Type: application/json" \
  -d '{
    "groupRequestIds": ["6f86bcc2-b7df-4ee0-aeb2-86bcb4630b44"],
    "clientIds": ["Smlpbi1LaW0tMjQtbWFsZQ=="],
    "chatTime": 15
  }'
```

### Disband a group
```
curl -X POST http://localhost:3000/api/groups/disband-group \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "group-id"
  }'
```
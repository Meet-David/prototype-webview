# MeetDavid - Finding friends in your neighborhood Prototype  

## How to run
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

## API Commands

### Form a group
```
curl -X POST http://localhost:3000/api/groups/form-group \
  -H "Content-Type: application/json" \
  -d '{
    "groupRequestIds": ["group-request-id-1", "group-request-id-2"],
    "clientIds": ["client-id-1", "client-id-2"],
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
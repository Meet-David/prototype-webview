curl -X POST http://localhost:3000/api/groups/form-group \
  -H "Content-Type: application/json" \
  -d '{
    "groupRequestIds": ["5a1397d4-01f5-4ed2-aa8e-e6279e3ba87a"],
    "clientIds": ["Smlpbi1LaW0tMjctbWFsZQ==", "Sm9obi1Eb3ZlLTMwLW1hbGU="],
    "chatTime": 15
  }'

curl -X POST http://localhost:3000/api/groups/disband-group \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "741e6760-c143-4f5b-9e62-886ff4e63f1a"
  }'
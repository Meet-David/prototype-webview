interface GroupMember {
  firstName: string;
  lastName: string;
}

export class Logger {
  static logEvent(event: string, details: any) {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 📡 ${event}`);
    console.log(JSON.stringify(details, null, 2));
  }

  static logWebSocketPool(
    clients: Map<string, any>,
    groupRequests: Map<string, any>,
    clientToGroup: Map<string, string>,
    activeGroups: Map<string, any>
  ) {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 📊 WebSocket Pool Status:`);
    
    console.log('\nActive Connections:');
    console.table(Array.from(clients.entries()).map(([id, client]) => ({
      clientId: id,
      name: `${client.firstName} ${client.lastName}`,
      hasGroupRequest: clientToGroup.has(id),
      timestamp: new Date().toISOString()
    })));

    console.log(`\nTotal Connections: ${clients.size}`);

    if (groupRequests.size > 0) {
      console.log('\nActive Group Requests:');
      console.table(Array.from(groupRequests.entries()).map(([id, request]) => ({
        groupId: id,
        creator: request.creatorName,
        size: request.groupSize,
        chatTime: `${request.chatTime}min`,
        age: `${request.ageRange.min}-${request.ageRange.max}`,
        distance: `${request.distance}km`,
        createdAt: new Date(request.createdAt).toLocaleTimeString()
      })));
    }

    console.log(`\nTotal Group Requests: ${groupRequests.size}`);

    if (activeGroups.size > 0) {
      console.log('\nActive Groups:');
      console.table(Array.from(activeGroups.entries()).map(([id, group]) => {
        const endTime = new Date(group.createdAt.getTime() + group.chatTime * 60 * 1000);
        return {
          groupId: id,
          members: group.members.map((m: GroupMember) => `${m.firstName} ${m.lastName}`).join(', '),
          memberCount: group.members.length,
          chatTime: `${group.chatTime}min`,
          createdAt: new Date(group.createdAt).toLocaleTimeString(),
          endsAt: endTime.toLocaleTimeString()
        };
      }));
    }

    console.log(`\nTotal Active Groups: ${activeGroups.size}\n`);
  }

  static logError(context: string, error: any) {
    const timestamp = new Date().toISOString();
    console.error(`\n[${timestamp}] ❌ Error in ${context}:`);
    console.error(error);
  }
} 
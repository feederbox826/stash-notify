aside from everything discord collects:

## SQL Tables
notifyUser
- userId - global *stash user UUID
- discordId - discord user snowflake
- instance - instance of stashDB to notify against
- comment - notify on comment Y/N
- vote - notify on vote Y/n

notifiedComments
- commentId - comment that has had notifications sent

notifiedVotes
- editId - the ID of the edit
- userId - the voting user
- date - date of the edit
#!/bin/bash

# Pane 4: Start database
tmux send-keys -t $SESSION_NAME:0.4 'docker compose up' C-m

# Pane 3: Wait for DB, then run API commands
tmux send-keys -t $SESSION_NAME:0.3 '
 npm run dev
 ' C-m

# Pane 0: Start client
tmux send-keys -t $SESSION_NAME:0.0 'npm run dev' C-m

# Pane 2: Wait for API, then launch Prisma Studio
tmux send-keys -t $SESSION_NAME:0.2 '
 npx prisma studio
 ' C-m
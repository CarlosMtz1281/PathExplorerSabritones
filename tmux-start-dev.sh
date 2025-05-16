#!/bin/bash
SESSION_NAME="my_session"

# Start tmux session in detached mode
tmux new-session -d -s $SESSION_NAME -n main

# First, split vertically for the basic 2-column layout
tmux split-window -h -t $SESSION_NAME:0.0

# Now, split the left column into 3 rows
tmux split-window -v -t $SESSION_NAME:0.0
tmux split-window -v -t $SESSION_NAME:0.0

# Split the right column into 2 rows
tmux split-window -v -t $SESSION_NAME:0.3

# Pane layout:
# 0 - top-left
# 1 - middle-left
# 2 - bottom-left
# 3 - top-right
# 4 - bottom-right

# Pane 4: Start database
# tmux send-keys -t $SESSION_NAME:0.4 'cd bd/postgres-docker && docker compose down -v && docker compose up' C-m

# Pane 3: Wait for DB, then run API commands
tmux send-keys -t $SESSION_NAME:0.3 '
 cd api &&
 echo "Waiting for PostgreSQL port to open..." &&
 while ! nc -z localhost 5433; do sleep 1; done &&
 echo "Waiting for database to be ready (prisma pull retry)..." &&
 until npx prisma db pull; do echo "Retrying..."; sleep 3; done &&
 npx prisma generate &&
 npm run dev
 ' C-m

# Pane 0: Start client
tmux send-keys -t $SESSION_NAME:0.0 'cd client && npm run dev' C-m

# Pane 2: Wait for API, then launch Prisma Studio
tmux send-keys -t $SESSION_NAME:0.2 '
 cd api &&
 echo "Waiting for API on port 3003..." &&
 while ! nc -z localhost 3003; do sleep 1; done &&
 echo "API is up. Starting Prisma Studio..." &&
 npx prisma studio
 ' C-m

# Pane 1: New middle-left pane
tmux send-keys -t $SESSION_NAME:0.1 'echo "Middle-left pane ready for use"; clear' C-m

# Optional: select a specific pane
tmux select-pane -t $SESSION_NAME:0.0

# Attach to session
tmux attach-session -t $SESSION_NAME
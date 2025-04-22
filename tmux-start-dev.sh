    #!/bin/bash
    SESSION_NAME="my_session"

    # Start tmux session in detached mode
    tmux new-session -d -s $SESSION_NAME -n main

    # Create 2x2 grid layout
    tmux split-window -v -t $SESSION_NAME:0.0            # Vertical split: top/bottom
    tmux split-window -h -t $SESSION_NAME:0.0            # Top-left to top-right
    tmux split-window -h -t $SESSION_NAME:0.2            # Bottom-left to bottom-right

    # Pane layout:
    # 0 - top-left: API
    # 1 - top-right: Client
    # 2 - bottom-left: Prisma Studio (after server starts)
    # 3 - bottom-right: DB (must start first)

    # Pane 3: Start database
    tmux send-keys -t $SESSION_NAME:0.3 'cd bd/postgres-docker && docker compose down -v && docker compose up' C-m

    # Pane 0: Wait for DB, then run API commands
    tmux send-keys -t $SESSION_NAME:0.0 '
    cd api &&
    echo "Waiting for PostgreSQL port to open..." &&
    while ! nc -z localhost 5433; do sleep 1; done &&
    echo "Waiting for database to be ready (prisma pull retry)..." &&
    until npx prisma db pull; do echo "Retrying..."; sleep 3; done &&
    npx prisma generate &&
    npm run dev
    ' C-m

    # Pane 1: Start client
    tmux send-keys -t $SESSION_NAME:0.1 'cd client && npm run dev' C-m

    # Pane 2: Wait for API, then launch Prisma Studio
    tmux send-keys -t $SESSION_NAME:0.2 '
    cd api &&
    echo "Waiting for API on port 3003..." &&
    while ! nc -z localhost 3003; do sleep 1; done &&
    echo "API is up. Starting Prisma Studio..." &&
    npx prisma studio
    ' C-m

    # Optional: select API pane
    tmux select-pane -t $SESSION_NAME:0.0

    # Attach to session
    tmux attach-session -t $SESSION_NAME

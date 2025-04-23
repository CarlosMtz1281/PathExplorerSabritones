# PathExplorerSabritones</br>

Class Project developed for Accenture Mx

## Project Developed By</br>

#### @CarlosMtz1281</br>
#### @EmilioDomM</br>
#### @dtdamm</br>
#### @GermanS04</br>
#### @ivangtamezc</br>
#### @nicoTC-04</br>

## Installation

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Steps to Run Locally

1. **Clone the repository**  
   ```sh
   git clone https://github.com/user/repo.git
   cd repo
   ```

2. **Install dependencies**  
   ```sh
   npm install
   ```
   or using Yarn:
   ```sh
   yarn install
   ```

3. **Run the development server**  
   ```sh
   npm run dev
   ```
   or with Yarn:
   ```sh
   yarn dev
   ```

4. **Access the app** 

---

### Steps to Run with Docker

1. **Build the Docker image**  
   ```sh
   docker build -t my-nextjs-app .
   ```

2. **Run the container**  
   ```sh
   docker run -p 3000:3000 my-nextjs-app
   ```

3. **Access the app** 

---

### Steps to Run with Docker Compose

1. **Start the services**  
   ```sh
   docker-compose up -d
   ```

2. **Stop the services**  
   ```sh
   docker-compose down
   ```
3. **Access the app** 

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact / Acknowledgments
- Created by Sabritones.

tmux commands
start
tmux send-keys -t $SESSION_NAME:0.4 'cd bd/postgres-docker && docker compose down -v && docker compose up' C-m

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


tmux list-panes -F '#{pane_id}' | while read pane; do tmux send-keys -t "$pane" C-c; done
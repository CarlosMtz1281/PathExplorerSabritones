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
tmux send-keys -t %5 'npm run dev' C-m
tmux send-keys -t %0 'npm run dev' C-m
tmux send-keys -t %4 'npx prisma studio' C-m

tmux list-panes -F '#{pane_id}' | while read pane; do tmux send-keys -t "$pane" C-c; done
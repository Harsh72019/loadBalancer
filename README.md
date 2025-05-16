# 🚀 Node.js Express Load Balancer

This project is a simple HTTP Load Balancer built with Node.js and Express. It distributes incoming client requests to multiple backend servers using a round-robin scheduling algorithm. It also performs periodic health checks to ensure only healthy backend servers receive traffic.

---

## Features

- Round-robin distribution of requests among backend servers
- Periodic health checks to monitor backend server availability
- Automatic removal and re-addition of backends based on health status
- Handles multiple concurrent client requests
- Easy to test with Python's built-in HTTP server

---

## Requirements

- Node.js (v14 or later)
- Python 3 (optional, for running test backend servers)

---

## Setup and Usage

### 1. Clone this repository

```bash
git clone https://github.com/Harsh72019/loadBalancer.git
cd loadBalancer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run backend servers (for testing)

Use Python's built-in HTTP server to quickly start backend servers:

```bash
mkdir server8080 && echo "Hello from 8080" > server8080/index.html
mkdir server8081 && echo "Hello from 8081" > server8081/index.html
mkdir server8082 && echo "Hello from 8082" > server8082/index.html

# Open three terminals and run:
python3 -m http.server 8080 --directory server8080
python3 -m http.server 8081 --directory server8081
python3 -m http.server 8082 --directory server8082
```

### 4. Start the load balancer

```bash
node loadBalancer.js
```

The load balancer listens on port `3000` by default.

### 5. Test the load balancer

Use curl or a browser to send requests to the load balancer:

```bash
curl http://localhost:3000
```

You should see responses rotating between the backend servers (8080, 8081, 8082).

---

## Health Checks

The load balancer performs a health check every 10 seconds (configurable in `loadBalancer.js`) by sending a GET request to each backend’s root path (`/`). Only servers responding with HTTP 200 are considered healthy.

If a backend fails the health check, it is temporarily removed from rotation. When it passes again, it is added back automatically.

---

## Testing Concurrent Requests

Create a file `urls.txt` with repeated URLs:

```
url = "http://localhost:3000"
url = "http://localhost:3000"
url = "http://localhost:3000"
url = "http://localhost:3000"
```

Run parallel curl requests:

```bash
curl --parallel --parallel-max 3 --config urls.txt
```

---

## Customization

- Change backend servers by editing the `backends` array in `loadBalancer.js`
- Adjust health check interval by modifying `HEALTH_CHECK_INTERVAL`
- Modify health check path by changing `HEALTH_CHECK_PATH`

---

## License

MIT License

---

## Author

Harsh Bali — [harshbali374@gmail.com](mailto:harshbali374@gmail.com)

---

Feel free to open issues or submit pull requests for improvements!

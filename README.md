<div align="center">

# RTMKT: Real-Time Mobile Kinematics Tracker
### 📱 ➡️ ⚡ ➡️ 💻
**A MERN-Stack Motion Visualization Tool for Physics Education**

[![React](https://img.shields.io/badge/frontend-React.js-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/server-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/realtime-Socket.IO-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br />

<img src="https://via.placeholder.com/800x400/000000/FFFFFF?text=RTMKT+Dashboard+Preview+(Live+Graphs+Here)" alt="RTMKT Dashboard Preview" width="800">

<p>
  <b>Turn any smartphone into a physics laboratory.</b><br>
  Stream live motion data from a phone's sensors directly to a classroom display.
</p>

</div>

---

## 📖 Overview

The **Real-Time Mobile Kinematics Tracker (RTMKT)** is an educational tool designed to bridge the gap between abstract physics equations and real-world motion.

Traditional physics labs often rely on expensive photogates or motion sensors. RTMKT utilizes the powerful hardware already in students' pockets—smartphones. By accessing the phone's accelerometer and GPS via a mobile browser, the system streams kinematic data instantaneously to a central web dashboard for the entire class to analyze.

> **Mission:** To allow students to *see* the physics behind movement dynamically, moving beyond static textbook diagrams.

## ✨ Key Features

### 🎯 For the Classroom
* **Live Visualization:** Instantly plot graphs for **Speed vs. Time** and **Acceleration vs. Time**.
* **Kinematic Quantities:** Real-time numerical readout of Velocity, Acceleration, Displacement, and Distance.
* **2D Trajectory Mapping:** Visualize the path of outdoor motion on a map using GPS data.
* **Zero Extra Hardware:** No specialized sensors required—just a phone and a laptop connected to WiFi.

### ⚙️ Technical Features
* **Real-Time Websockets:** Powered by **Socket.IO** for ultra-low latency data streaming between devices.
* **Dual-View Interface:**
    * **📱 Mobile Sender (React):** A minimalist interface for the moving device that captures and transmits sensor data.
    * **💻 Dashboard Receiver (React):** A data-rich display with dynamic charting (e.g., Recharts/Chart.js) for the teacher/observer.
* **Data Persistence (MongoDB):** Save experimental runs to the database enabling students to download CSV data later for homework analysis.

## 🏗️ Architecture & Tech Stack

RTMKT is built using the **MERN Stack**, optimized for real-time event handling.

```mermaid
%% Note: If GitHub's mermaid rendering is slow, you can replace this with a static image
graph TD
    subgraph "Movement Source"
        Mobile[📱 Smartphone Browser React App] -->|Reads Accelerometer/GPS| MobileData(Sensor Data)
    end

    subgraph "Real-Time Bridge"
        MobileData -->|Emits via Socket.IO| Server[🟢 Node.js + Express Server]
    end

    subgraph "Visualization & Storage"
        Server -->|Broadcasts via Socket.IO| Dashboard[💻 Laptop Dashboard React App]
        Server -.->|Saves Session| DB[(🍃 MongoDB)]
        Dashboard -->|Renders| Graphs(📈 Live Graphs & Stats)
    end

    style Server fill:#339933,stroke:#333,stroke-width:2px,color:white
    style DB fill:#47A248,stroke:#333,stroke-width:2px,color:white
    style Mobile fill:#61DAFB,stroke:#333,stroke-width:2px
    style Dashboard fill:#61DAFB,stroke:#333,stroke-width:2px

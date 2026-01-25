/* eslint-disable @typescript-eslint/no-explicit-any */
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../helpers/SD";

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  startConnection() {
    const cartToken = localStorage.getItem("cartToken") || "";
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/orderHub?cartToken=${cartToken}`, {
        accessTokenFactory: () => {
          const token = localStorage.getItem("token");
          return token ? token : "";
        },
      })
      .withAutomaticReconnect()
      .build();

    this.connection
      .start()
      .then(() => console.log("✅ SignalR: OrderHub Connected!"))
      .catch((err) => {
        console.error("❌ SignalR: Connection Failed: ", err);
        setTimeout(() => this.startConnection(), 5000);
      });
  }

  // --- จุดสำคัญที่ต้องแก้ ---
  stopConnection(): Promise<void> {
    if (this.connection) {
      // ต้อง return promise ออกไปเพื่อให้ภายนอกใช้ .then() ได้
      return this.connection.stop()
        .then(() => {
          console.log("SignalR: Connection Stopped");
          this.connection = null; // ล้างค่าทิ้งด้วย
        });
    }
    // ถ้าไม่มี connection ให้ return promise ที่สำเร็จแล้วออกไปเลย
    return Promise.resolve();
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.connection) return;
    this.connection.on(eventName, callback);
  }

  off(eventName: string, callback?: (...args: any[]) => void) {
    if (!this.connection) return;
    if (callback) {
      this.connection.off(eventName, callback);
    } else {
      this.connection.off(eventName);
    }
  }

  async invoke(methodName: string, ...args: any[]) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return await this.connection.invoke(methodName, ...args);
    }
  }
}

export const signalRService = new SignalRService();